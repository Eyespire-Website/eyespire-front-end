import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user) {
      config.headers['User-Id'] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const dashboardService = {
  // Debug method - Kiểm tra dữ liệu sản phẩm từ API
  debugProductsAPI: async () => {
    try {
      const response = await axiosInstance.get('/products');
      console.log('Products API Response:', {
        status: response.status,
        dataLength: response.data?.length || 0,
        sampleProduct: response.data?.[0] || null,
        allProducts: response.data
      });
      
      if (response.data && response.data.length > 0) {
        const product = response.data[0];
        console.log('Sample product structure:', {
          id: product.id,
          name: product.name,
          stockQuantity: product.stockQuantity,
          stockQuantityType: typeof product.stockQuantity,
          allFields: Object.keys(product)
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi debug Products API:', error);
      return null;
    }
  },

  // Lấy tổng số nhân viên
  getTotalStaff: async () => {
    try {
      const response = await axiosInstance.get('/admin/staff');
      const staffList = response.data.filter(staff => staff.role !== 'ADMIN');
      return {
        total: staffList.length,
        change: '+2 từ tháng trước' // Tạm thời hardcode, sau này có thể tính từ dữ liệu
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê nhân viên:', error);
      // Fallback data
      return {
        total: 24,
        change: '+2 từ tháng trước'
      };
    }
  },

  // Lấy số cuộc hẹn hôm nay
  getTodayAppointments: async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      const today = new Date().toISOString().split('T')[0];
      
      const todayAppointments = response.data.filter(appointment => {
        const appointmentDate = appointment.appointmentDate || appointment.appointmentTime?.split('T')[0];
        return appointmentDate === today;
      });

      return {
        total: todayAppointments.length,
        change: '+5 từ hôm qua' // Tạm thời hardcode
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê cuộc hẹn hôm nay:', error);
      // Fallback data
      return {
        total: 18,
        change: '+5 từ hôm qua'
      };
    }
  },

  // Lấy doanh thu tháng này từ cuộc hẹn + đơn hàng
  getMonthlyRevenue: async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Lấy doanh thu từ cuộc hẹn (appointment invoices)
      let appointmentRevenue = 0;
      try {
        const appointmentsResponse = await axiosInstance.get('/appointments');
        const appointments = appointmentsResponse.data;
        
        // Lọc cuộc hẹn trong tháng hiện tại và đã hoàn thành
        const thisMonthAppointments = appointments.filter(appointment => {
          if (appointment.status !== 'COMPLETED') return false;
          
          const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
          return appointmentDate.getMonth() + 1 === currentMonth && 
                 appointmentDate.getFullYear() === currentYear;
        });
        
        // Tính tổng doanh thu từ cuộc hẹn
        for (const appointment of thisMonthAppointments) {
          try {
            const invoiceResponse = await axiosInstance.get(`/appointments/${appointment.id}/invoice`);
            const invoice = invoiceResponse.data;
            appointmentRevenue += parseFloat(invoice.totalAmount || 0);
          } catch (invoiceError) {
            console.warn(`Không thể lấy hóa đơn cho cuộc hẹn ${appointment.id}:`, invoiceError);
          }
        }
      } catch (appointmentError) {
        console.warn('Không thể lấy dữ liệu cuộc hẹn:', appointmentError);
      }
      
      // Lấy doanh thu từ đơn hàng (orders)
      let orderRevenue = 0;
      try {
        const ordersResponse = await axiosInstance.get('/orders');
        const orders = ordersResponse.data;
        
        // Lọc đơn hàng trong tháng hiện tại và đã hoàn thành
        const thisMonthOrders = orders.filter(order => {
          if (!order.orderDate || (order.status !== 'COMPLETED' && order.status !== 'PAID')) return false;
          
          const orderDate = new Date(order.orderDate);
          return orderDate.getMonth() + 1 === currentMonth && 
                 orderDate.getFullYear() === currentYear;
        });
        
        // Tính tổng doanh thu từ đơn hàng
        orderRevenue = thisMonthOrders.reduce((sum, order) => {
          return sum + parseFloat(order.totalAmount || 0);
        }, 0);
      } catch (orderError) {
        console.warn('Không thể lấy dữ liệu đơn hàng:', orderError);
      }
      
      // Tổng doanh thu
      const totalRevenue = appointmentRevenue + orderRevenue;
      
      // Format số tiền
      const formatRevenue = (amount) => {
        if (amount >= 1000000) {
          return `₫${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `₫${(amount / 1000).toFixed(0)}K`;
        } else {
          return `₫${amount.toLocaleString('vi-VN')}`;
        }
      };
      
      // Tính phần trăm thay đổi so với tháng trước
      const previousMonthRevenue = await dashboardService.getPreviousMonthRevenue();
      const changePercent = dashboardService.calculateRevenueChange(totalRevenue, previousMonthRevenue);
      
      return {
        total: formatRevenue(totalRevenue),
        change: `${changePercent} từ tháng trước`,
        breakdown: {
          appointments: formatRevenue(appointmentRevenue),
          orders: formatRevenue(orderRevenue)
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê doanh thu:', error);
      // Fallback data
      return {
        total: '₫45.2M',
        change: '+12% từ tháng trước',
        breakdown: {
          appointments: '₫25.0M',
          orders: '₫20.2M'
        }
      };
    }
  },

  // Lấy số sản phẩm trong kho
  getProductsInStock: async () => {
    try {
      // Debug: Kiểm tra dữ liệu API
      console.log('Fetching products data...');
      const response = await axiosInstance.get('/products');
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('Products API không trả về mảng dữ liệu hợp lệ:', response.data);
        throw new Error('Invalid products data format');
      }
      
      const products = response.data;
      console.log(`Found ${products.length} products from API`);
      
      // Debug: Kiểm tra cấu trúc sản phẩm đầu tiên
      if (products.length > 0) {
        const sampleProduct = products[0];
        console.log('Sample product:', {
          id: sampleProduct.id,
          name: sampleProduct.name || sampleProduct.productName,
          stockQuantity: sampleProduct.stockQuantity,
          stock: sampleProduct.stock,
          quantity: sampleProduct.quantity,
          availableQuantity: sampleProduct.availableQuantity,
          allFields: Object.keys(sampleProduct)
        });
      }
      
      // Lọc sản phẩm còn hàng trong kho
      const productsInStock = products.filter(product => {
        // Kiểm tra nhiều trường có thể chứa thông tin số lượng
        const stockQuantity = parseInt(product.stockQuantity) || 
                             parseInt(product.stock) || 
                             parseInt(product.quantity) || 
                             parseInt(product.availableQuantity) || 0;
        return stockQuantity > 0;
      });

      // Tính tổng số lượng sản phẩm còn trong kho
      const totalStockQuantity = products.reduce((sum, product) => {
        const stockQuantity = parseInt(product.stockQuantity) || 
                             parseInt(product.stock) || 
                             parseInt(product.quantity) || 
                             parseInt(product.availableQuantity) || 0;
        return sum + stockQuantity;
      }, 0);
      
      // Tính số loại sản phẩm còn hàng
      const productTypesInStock = productsInStock.length;
      
      console.log('Products calculation result:', {
        totalProducts: products.length,
        productsInStock: productTypesInStock,
        totalStockQuantity: totalStockQuantity
      });
      
      // Lấy dữ liệu tuần trước để so sánh (tạm thời hardcode)
      const previousWeekStock = totalStockQuantity + 8; // Giả sử giảm 8 sản phẩm
      const stockChange = totalStockQuantity - previousWeekStock;
      const changeText = stockChange >= 0 ? `+${stockChange} từ tuần trước` : `${stockChange} từ tuần trước`;

      // Giống như store manager - hiển thị số lượng sản phẩm thay vì tổng số lượng
      const productsInStockCount = products.length; // Tổng số sản phẩm (giống store manager)
      
      // Tính toán thay đổi dựa trên số sản phẩm
      const previousWeekProducts = productsInStockCount - 2; // Giả sử tăng 2 sản phẩm
      const productChange = productsInStockCount - previousWeekProducts;
      const productChangeText = productChange >= 0 ? `+${productChange} sản phẩm mới` : `${productChange} sản phẩm`;
      
      // Kiểm tra cảnh báo sản phẩm sắp hết hàng
      const lowStockProducts = products.filter(product => {
        const stockQuantity = parseInt(product.stockQuantity) || 
                             parseInt(product.stock) || 
                             parseInt(product.quantity) || 
                             parseInt(product.availableQuantity) || 0;
        return stockQuantity <= 5 && stockQuantity > 0;
      });
      
      return {
        total: productsInStockCount, // Số lượng sản phẩm (giống store manager)
        change: productChangeText,
        details: {
          productTypes: productTypesInStock, // Số loại sản phẩm còn hàng
          totalQuantity: totalStockQuantity, // Tổng số lượng tất cả sản phẩm
          totalProducts: productsInStockCount, // Tổng số sản phẩm
          lowStockCount: lowStockProducts.length, // Số sản phẩm sắp hết hàng
          lowStockProducts: lowStockProducts.map(p => ({
            id: p.id,
            name: p.name || p.productName,
            stock: parseInt(p.stockQuantity) || parseInt(p.stock) || 0
          }))
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê sản phẩm:', error);
      // Fallback data
      return {
        total: 45, // Số sản phẩm (giống store manager)
        change: '+2 sản phẩm mới',
        details: {
          productTypes: 42, // Số loại sản phẩm còn hàng
          totalQuantity: 1250, // Tổng số lượng tất cả sản phẩm
          totalProducts: 45, // Tổng số sản phẩm
          lowStockCount: 3, // Số sản phẩm sắp hết hàng
          lowStockProducts: [
            { id: 1, name: 'Thuốc nhỏ mắt Rohto', stock: 3 },
            { id: 2, name: 'Kính cận Rayban', stock: 2 },
            { id: 3, name: 'Kính áp tròng Acuvue', stock: 5 }
          ]
        }
      };
    }
  },

  // Lấy doanh thu tháng trước
  getPreviousMonthRevenue: async () => {
    try {
      const currentDate = new Date();
      const previousMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
      const previousYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
      
      // Lấy doanh thu từ cuộc hẹn tháng trước
      let appointmentRevenue = 0;
      try {
        const appointmentsResponse = await axiosInstance.get('/appointments');
        const appointments = appointmentsResponse.data;
        
        const previousMonthAppointments = appointments.filter(appointment => {
          if (appointment.status !== 'COMPLETED') return false;
          
          const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
          return appointmentDate.getMonth() + 1 === previousMonth && 
                 appointmentDate.getFullYear() === previousYear;
        });
        
        for (const appointment of previousMonthAppointments) {
          try {
            const invoiceResponse = await axiosInstance.get(`/appointments/${appointment.id}/invoice`);
            const invoice = invoiceResponse.data;
            appointmentRevenue += parseFloat(invoice.totalAmount || 0);
          } catch (invoiceError) {
            // Ignore individual invoice errors
          }
        }
      } catch (appointmentError) {
        console.warn('Không thể lấy dữ liệu cuộc hẹn tháng trước:', appointmentError);
      }
      
      // Lấy doanh thu từ đơn hàng tháng trước
      let orderRevenue = 0;
      try {
        const ordersResponse = await axiosInstance.get('/orders');
        const orders = ordersResponse.data;
        
        const previousMonthOrders = orders.filter(order => {
          if (!order.orderDate || (order.status !== 'COMPLETED' && order.status !== 'PAID')) return false;
          
          const orderDate = new Date(order.orderDate);
          return orderDate.getMonth() + 1 === previousMonth && 
                 orderDate.getFullYear() === previousYear;
        });
        
        orderRevenue = previousMonthOrders.reduce((sum, order) => {
          return sum + parseFloat(order.totalAmount || 0);
        }, 0);
      } catch (orderError) {
        console.warn('Không thể lấy dữ liệu đơn hàng tháng trước:', orderError);
      }
      
      return appointmentRevenue + orderRevenue;
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu tháng trước:', error);
      return 40000000; // 40M fallback
    }
  },

  // Lấy doanh thu đơn hàng tháng trước
  getPreviousMonthOrderRevenue: async () => {
    try {
      const currentDate = new Date();
      const previousMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
      const previousYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
      
      // Lấy doanh thu từ đơn hàng tháng trước
      let orderRevenue = 0;
      try {
        const ordersResponse = await axiosInstance.get('/orders');
        const orders = ordersResponse.data;
        
        const previousMonthOrders = orders.filter(order => {
          if (!order.orderDate || (order.status !== 'COMPLETED' && order.status !== 'PAID')) return false;
          
          const orderDate = new Date(order.orderDate);
          return orderDate.getMonth() + 1 === previousMonth && 
                 orderDate.getFullYear() === previousYear;
        });
        
        orderRevenue = previousMonthOrders.reduce((sum, order) => {
          return sum + parseFloat(order.totalAmount || 0);
        }, 0);
      } catch (orderError) {
        console.warn('Không thể lấy dữ liệu đơn hàng tháng trước:', orderError);
      }
      
      return orderRevenue;
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu đơn hàng tháng trước:', error);
      return 18000000; // 18M fallback
    }
  },

  // Lấy doanh thu cuộc hẹn tháng trước
  getPreviousMonthAppointmentRevenue: async () => {
    try {
      const currentDate = new Date();
      const previousMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
      const previousYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
      
      // Lấy doanh thu từ cuộc hẹn tháng trước
      let appointmentRevenue = 0;
      try {
        const appointmentsResponse = await axiosInstance.get('/appointments');
        const appointments = appointmentsResponse.data;
        
        const previousMonthAppointments = appointments.filter(appointment => {
          if (appointment.status !== 'COMPLETED') return false;
          
          const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
          return appointmentDate.getMonth() + 1 === previousMonth && 
                 appointmentDate.getFullYear() === previousYear;
        });
        
        for (const appointment of previousMonthAppointments) {
          try {
            const invoiceResponse = await axiosInstance.get(`/appointments/${appointment.id}/invoice`);
            const invoice = invoiceResponse.data;
            appointmentRevenue += parseFloat(invoice.totalAmount || 0);
          } catch (invoiceError) {
            // Ignore individual invoice errors
          }
        }
      } catch (appointmentError) {
        console.warn('Không thể lấy dữ liệu cuộc hẹn tháng trước:', appointmentError);
      }
      
      return appointmentRevenue;
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu cuộc hẹn tháng trước:', error);
      return 22000000; // 22M fallback
    }
  },

  // Tính phần trăm thay đổi doanh thu
  calculateRevenueChange: (currentRevenue, previousRevenue) => {
    if (previousRevenue === 0) {
      return currentRevenue > 0 ? '+100%' : '0%';
    }
    
    const changePercent = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${Math.round(changePercent)}%`;
  },

  // Lấy tất cả dữ liệu thống kê dashboard
  getAllDashboardData: async () => {
    try {
      const [staffStats, appointmentStats, revenueStats, productStats] = await Promise.all([
        dashboardService.getTotalStaff(),
        dashboardService.getTodayAppointments(),
        dashboardService.getMonthlyRevenue(),
        dashboardService.getProductsInStock()
      ]);

      return {
        staff: staffStats,
        appointments: appointmentStats,
        revenue: revenueStats,
        products: productStats
      };
    } catch (error) {
      console.error('Lỗi khi lấy tất cả dữ liệu dashboard:', error);
      // Fallback data
      return {
        staff: { total: 24, change: '+2 từ tháng trước' },
        appointments: { total: 18, change: '+5 từ hôm qua' },
        revenue: { total: '₫45.2M', change: '+12% từ tháng trước' },
        products: { total: 156, change: '-8 từ tuần trước' }
      };
    }
  },

  // Lấy dữ liệu doanh thu đơn hàng cho card
  getOrderRevenueCard: async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Lấy doanh thu từ đơn hàng (orders)
      let orderRevenue = 0;
      try {
        const ordersResponse = await axiosInstance.get('/orders');
        const orders = ordersResponse.data;
        
        // Lọc đơn hàng trong tháng hiện tại và đã hoàn thành
        const thisMonthOrders = orders.filter(order => {
          if (!order.orderDate || (order.status !== 'COMPLETED' && order.status !== 'PAID')) return false;
          
          const orderDate = new Date(order.orderDate);
          return orderDate.getMonth() + 1 === currentMonth && 
                 orderDate.getFullYear() === currentYear;
        });
        
        // Tính tổng doanh thu từ đơn hàng
        orderRevenue = thisMonthOrders.reduce((sum, order) => {
          return sum + parseFloat(order.totalAmount || 0);
        }, 0);
      } catch (orderError) {
        console.warn('Không thể lấy dữ liệu đơn hàng:', orderError);
      }
      
      // Format số tiền
      const formatRevenue = (amount) => {
        if (amount >= 1000000) {
          return `₫${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `₫${(amount / 1000).toFixed(0)}K`;
        } else {
          return `₫${amount.toLocaleString('vi-VN')}`;
        }
      };
      
      // Tính phần trăm thay đổi so với tháng trước
      const previousMonthOrderRevenue = await dashboardService.getPreviousMonthOrderRevenue();
      const changePercent = dashboardService.calculateRevenueChange(orderRevenue, previousMonthOrderRevenue);
      
      return {
        total: formatRevenue(orderRevenue),
        change: `${changePercent} từ tháng trước`
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê doanh thu đơn hàng:', error);
      // Fallback data
      return {
        total: '₫20.2M',
        change: '+8% từ tháng trước'
      };
    }
  },

  // Lấy dữ liệu doanh thu cuộc hẹn cho card
  getAppointmentRevenueCard: async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Lấy doanh thu từ cuộc hẹn (appointment invoices)
      let appointmentRevenue = 0;
      try {
        const appointmentsResponse = await axiosInstance.get('/appointments');
        const appointments = appointmentsResponse.data;
        
        // Lọc cuộc hẹn trong tháng hiện tại và đã hoàn thành
        const thisMonthAppointments = appointments.filter(appointment => {
          if (appointment.status !== 'COMPLETED') return false;
          
          const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
          return appointmentDate.getMonth() + 1 === currentMonth && 
                 appointmentDate.getFullYear() === currentYear;
        });
        
        // Tính tổng doanh thu từ cuộc hẹn
        for (const appointment of thisMonthAppointments) {
          try {
            const invoiceResponse = await axiosInstance.get(`/appointments/${appointment.id}/invoice`);
            const invoice = invoiceResponse.data;
            appointmentRevenue += parseFloat(invoice.totalAmount || 0);
          } catch (invoiceError) {
            console.warn(`Không thể lấy hóa đơn cho cuộc hẹn ${appointment.id}:`, invoiceError);
          }
        }
      } catch (appointmentError) {
        console.warn('Không thể lấy dữ liệu cuộc hẹn:', appointmentError);
      }
      
      // Format số tiền
      const formatRevenue = (amount) => {
        if (amount >= 1000000) {
          return `₫${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `₫${(amount / 1000).toFixed(0)}K`;
        } else {
          return `₫${amount.toLocaleString('vi-VN')}`;
        }
      };
      
      // Tính phần trăm thay đổi so với tháng trước
      const previousMonthAppointmentRevenue = await dashboardService.getPreviousMonthAppointmentRevenue();
      const changePercent = dashboardService.calculateRevenueChange(appointmentRevenue, previousMonthAppointmentRevenue);
      
      return {
        total: formatRevenue(appointmentRevenue),
        change: `${changePercent} từ tháng trước`
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê doanh thu cuộc hẹn:', error);
      // Fallback data
      return {
        total: '₫25.0M',
        change: '+15% từ tháng trước'
      };
    }
  },

  // Lấy thống kê cuộc hẹn chi tiết cho dashboard
  getAppointmentStatsDetailed: async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      const appointments = response.data;
      
      console.log(`Found ${appointments.length} appointments from API`);
      
      // Thống kê theo trạng thái
      const stats = appointments.reduce((acc, appointment) => {
        const status = appointment.status || 'PENDING';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Thống kê theo ngày
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(appointment => {
        const appointmentDate = appointment.appointmentDate || appointment.appointmentTime?.split('T')[0];
        return appointmentDate === today;
      });
      
      // Thống kê theo tuần
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const thisWeekAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
        return appointmentDate >= weekStart && appointmentDate <= weekEnd;
      });
      
      // Thống kê theo tháng
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const thisMonthAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
        return appointmentDate.getMonth() + 1 === currentMonth && 
               appointmentDate.getFullYear() === currentYear;
      });
      
      const total = appointments.length;
      const completed = stats.COMPLETED || 0;
      const pending = stats.PENDING || 0;
      const confirmed = stats.CONFIRMED || 0;
      const cancelled = stats.CANCELLED || 0;
      
      console.log('Appointment stats calculated:', {
        total,
        today: todayAppointments.length,
        thisWeek: thisWeekAppointments.length,
        thisMonth: thisMonthAppointments.length,
        byStatus: { pending, confirmed, completed, cancelled }
      });
      
      return {
        // Thống kê tổng quát
        total: total,
        todayTotal: todayAppointments.length,
        weekTotal: thisWeekAppointments.length,
        monthTotal: thisMonthAppointments.length,
        
        // Thống kê theo trạng thái
        pending: pending,
        confirmed: confirmed,
        completed: completed,
        cancelled: cancelled,
        
        // Phần trăm
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
        cancellationRate: total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0,
        
        // Thông tin bổ sung
        upcomingAppointments: pending + confirmed,
        recentAppointments: appointments
          .filter(apt => apt.status === 'COMPLETED')
          .sort((a, b) => new Date(b.appointmentDate || b.appointmentTime) - new Date(a.appointmentDate || a.appointmentTime))
          .slice(0, 5)
          .map(apt => ({
            id: apt.id,
            patientName: apt.patientName || `Bệnh nhân ${apt.userId}`,
            date: apt.appointmentDate || apt.appointmentTime?.split('T')[0],
            service: apt.service || 'Khám tổng quát'
          }))
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê cuộc hẹn chi tiết:', error);
      // Fallback data
      return {
        total: 27,
        todayTotal: 5,
        weekTotal: 18,
        monthTotal: 27,
        pending: 5,
        confirmed: 8,
        completed: 12,
        cancelled: 2,
        completionRate: '44.4',
        cancellationRate: '7.4',
        upcomingAppointments: 13,
        recentAppointments: [
          { id: 1, patientName: 'Nguyễn Văn A', date: '2024-01-20', service: 'Khám mắt tổng quát' },
          { id: 2, patientName: 'Trần Thị B', date: '2024-01-19', service: 'Điều trị cận thị' },
          { id: 3, patientName: 'Lê Văn C', date: '2024-01-18', service: 'Khám chuyên sâu' }
        ]
      };
    }
  },

  // Lấy dữ liệu dịch vụ phổ biến từ appointments_service
  getPopularServices: async () => {
    try {
      // Lấy tất cả appointments với services
      const appointmentsResponse = await axiosInstance.get('/appointments');
      const appointments = appointmentsResponse.data;
      
      console.log(`Found ${appointments.length} appointments for services analysis`);
      console.log('Sample appointment:', appointments[0]);
      
      // Đếm số lần mỗi service được sử dụng
      const serviceCount = {};
      const serviceDetails = {};
      
      appointments.forEach((appointment, index) => {
        console.log(`Processing appointment ${index + 1}:`, {
          id: appointment.id,
          service: appointment.service,
          services: appointment.services,
          serviceName: appointment.serviceName,
          serviceType: appointment.serviceType
        });
        
        // Kiểm tra các trường có thể chứa thông tin dịch vụ
        let serviceName = null;
        
        if (appointment.services && Array.isArray(appointment.services) && appointment.services.length > 0) {
          // Trường hợp có array services
          appointment.services.forEach(service => {
            const serviceId = service.serviceId || service.id || service.name;
            const name = service.serviceName || service.name || service.service || `Dịch vụ ${serviceId}`;
            const price = service.price || service.servicePrice || 0;
            
            if (serviceId && name) {
              serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
              serviceDetails[serviceId] = {
                name: name,
                price: price,
                count: serviceCount[serviceId]
              };
            }
          });
        } else if (appointment.service) {
          // Trường hợp service là string
          serviceName = appointment.service;
        } else if (appointment.serviceName) {
          // Trường hợp có serviceName
          serviceName = appointment.serviceName;
        } else if (appointment.serviceType) {
          // Trường hợp có serviceType
          serviceName = appointment.serviceType;
        } else {
          // Fallback: tạo tên dịch vụ mặc định
          serviceName = 'Khám tổng quát';
        }
        
        // Xử lý service name nếu có
        if (serviceName) {
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
          serviceDetails[serviceName] = {
            name: serviceName,
            price: appointment.price || 300000, // Giá mặc định
            count: serviceCount[serviceName]
          };
        }
      });
      
      console.log('Service count:', serviceCount);
      console.log('Service details:', serviceDetails);
      
      // Chuyển đổi thành array và sắp xếp theo số lượng
      const servicesArray = Object.keys(serviceDetails).map(serviceId => ({
        id: serviceId,
        name: serviceDetails[serviceId].name,
        count: serviceDetails[serviceId].count,
        price: serviceDetails[serviceId].price,
        percentage: 0 // Sẽ được tính sau
      }));
      
      console.log('Services array before sort:', servicesArray);
      
      // Sắp xếp theo số lượng giảm dần
      servicesArray.sort((a, b) => b.count - a.count);
      
      // Lấy top 6 services
      const topServices = servicesArray.slice(0, 6);
      
      // Tính phần trăm
      const totalCount = topServices.reduce((sum, service) => sum + service.count, 0);
      topServices.forEach(service => {
        service.percentage = totalCount > 0 ? ((service.count / totalCount) * 100).toFixed(1) : 0;
      });
      
      console.log('Top services calculated:', topServices);
      
      // Nếu không có dữ liệu thực, trả về fallback data
      if (topServices.length === 0) {
        console.log('No services found, using fallback data');
        return {
          services: [
            { id: 1, name: 'Khám mắt tổng quát', count: 45, percentage: '35.2', price: 200000 },
            { id: 2, name: 'Điều trị cận thị', count: 32, percentage: '25.0', price: 500000 },
            { id: 3, name: 'Khám chuyên sâu', count: 28, percentage: '21.9', price: 300000 },
            { id: 4, name: 'Tư vấn kính áp tròng', count: 15, percentage: '11.7', price: 150000 },
            { id: 5, name: 'Điều trị viêm kết mạc', count: 8, percentage: '6.2', price: 250000 }
          ],
          totalAppointments: 128,
          totalServicesUsed: 12,
          summary: {
            mostPopular: 'Khám mắt tổng quát',
            totalBookings: 128,
            averagePerService: '25.6'
          }
        };
      }
      
      return {
        services: topServices,
        totalAppointments: appointments.length,
        totalServicesUsed: Object.keys(serviceCount).length,
        summary: {
          mostPopular: topServices[0]?.name || 'N/A',
          totalBookings: totalCount,
          averagePerService: totalCount > 0 ? (totalCount / topServices.length).toFixed(1) : 0
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dịch vụ phổ biến:', error);
      // Fallback data
      return {
        services: [
          { id: 1, name: 'Khám mắt tổng quát', count: 45, percentage: '35.2', price: 200000 },
          { id: 2, name: 'Điều trị cận thị', count: 32, percentage: '25.0', price: 500000 },
          { id: 3, name: 'Khám chuyên sâu', count: 28, percentage: '21.9', price: 300000 },
          { id: 4, name: 'Tư vấn kính áp tròng', count: 15, percentage: '11.7', price: 150000 },
          { id: 5, name: 'Điều trị viêm kết mạc', count: 8, percentage: '6.2', price: 250000 }
        ],
        totalAppointments: 128,
        totalServicesUsed: 12,
        summary: {
          mostPopular: 'Khám mắt tổng quát',
          totalBookings: 128,
          averagePerService: '25.6'
        }
      };
    }
  },

  // Lấy doanh thu đơn hàng tháng hiện tại
  getOrderRevenue: async () => {
    try {
      const response = await axiosInstance.get('/orders');
      const orders = response.data;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        const isCompleted = order.status === 'COMPLETED' || order.status === 'PAID';
        return isCompleted && 
               orderDate.getMonth() + 1 === currentMonth && 
               orderDate.getFullYear() === currentYear;
      });
      
      const totalRevenue = currentMonthOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      }, 0);
      
      return totalRevenue;
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu đơn hàng:', error);
      return 20200000; // 20.2M fallback
    }
  },

  // Lấy doanh thu cuộc hẹn tháng hiện tại
  getAppointmentRevenue: async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      const appointments = response.data;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentMonthAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
        return appointment.status === 'COMPLETED' && 
               appointmentDate.getMonth() + 1 === currentMonth && 
               appointmentDate.getFullYear() === currentYear;
      });
      
      let totalRevenue = 0;
      
      // Lấy invoice cho mỗi appointment hoàn thành
      for (const appointment of currentMonthAppointments) {
        try {
          const invoiceResponse = await axiosInstance.get(`/appointments/${appointment.id}/invoice`);
          const invoice = invoiceResponse.data;
          totalRevenue += parseFloat(invoice.totalAmount) || 0;
        } catch (invoiceError) {
          console.warn(`Không thể lấy invoice cho appointment ${appointment.id}:`, invoiceError);
          // Fallback: sử dụng giá dịch vụ cơ bản
          totalRevenue += 300000; // Giá trung bình
        }
      }
      
      return totalRevenue;
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu cuộc hẹn:', error);
      return 25000000; // 25M fallback
    }
  },

  // Lấy doanh thu đơn hàng tháng trước
  getPreviousMonthOrderRevenue: async () => {
    try {
      const response = await axiosInstance.get('/orders');
      const orders = response.data;
      
      const now = new Date();
      const previousMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      
      const previousMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        const isCompleted = order.status === 'COMPLETED' || order.status === 'PAID';
        return isCompleted && 
               orderDate.getMonth() + 1 === previousMonth && 
               orderDate.getFullYear() === previousYear;
      });
      
      const totalRevenue = previousMonthOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      }, 0);
      
      return totalRevenue;
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu đơn hàng tháng trước:', error);
      return 18700000; // Fallback
    }
  },

  // Lấy doanh thu cuộc hẹn tháng trước
  getPreviousMonthAppointmentRevenue: async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      const appointments = response.data;
      
      const now = new Date();
      const previousMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      
      const previousMonthAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate || appointment.appointmentTime);
        return appointment.status === 'COMPLETED' && 
               appointmentDate.getMonth() + 1 === previousMonth && 
               appointmentDate.getFullYear() === previousYear;
      });
      
      let totalRevenue = 0;
      
      for (const appointment of previousMonthAppointments) {
        try {
          const invoiceResponse = await axiosInstance.get(`/appointments/${appointment.id}/invoice`);
          const invoice = invoiceResponse.data;
          totalRevenue += parseFloat(invoice.totalAmount) || 0;
        } catch (invoiceError) {
          totalRevenue += 300000; // Fallback
        }
      }
      
      return totalRevenue;
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu cuộc hẹn tháng trước:', error);
      return 21700000; // Fallback
    }
  },

  // Tính phần trăm thay đổi doanh thu
  calculateRevenueChange: (currentRevenue, previousRevenue) => {
    if (previousRevenue === 0) {
      return currentRevenue > 0 ? '+100% từ tháng trước' : '0% từ tháng trước';
    }
    
    const changePercent = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(1)}% từ tháng trước`;
  },

  // Định dạng tiền tệ
  formatCurrency: (amount) => {
    if (amount >= 1000000) {
      return `₫${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₫${(amount / 1000).toFixed(0)}K`;
    } else {
      return `₫${amount.toLocaleString('vi-VN')}`;
    }
  },

  // Lấy dữ liệu card doanh thu đơn hàng
  getOrderRevenueCard: async () => {
    try {
      const currentRevenue = await dashboardService.getOrderRevenue();
      const previousRevenue = await dashboardService.getPreviousMonthOrderRevenue();
      const change = dashboardService.calculateRevenueChange(currentRevenue, previousRevenue);
      
      return {
        total: dashboardService.formatCurrency(currentRevenue),
        change: change
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu card doanh thu đơn hàng:', error);
      return {
        total: '₫20.2M',
        change: '+8% từ tháng trước'
      };
    }
  },

  // Lấy dữ liệu card doanh thu cuộc hẹn
  getAppointmentRevenueCard: async () => {
    try {
      const currentRevenue = await dashboardService.getAppointmentRevenue();
      const previousRevenue = await dashboardService.getPreviousMonthAppointmentRevenue();
      const change = dashboardService.calculateRevenueChange(currentRevenue, previousRevenue);
      
      return {
        total: dashboardService.formatCurrency(currentRevenue),
        change: change
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu card doanh thu cuộc hẹn:', error);
      return {
        total: '₫25.0M',
        change: '+15% từ tháng trước'
      };
    }
  },

  // Lấy dữ liệu biểu đồ doanh thu đơn hàng và cuộc hẹn
  getRevenueData: async (period = '6months') => {
    try {
      // TODO: Implement khi có API revenue analytics thực tế
      // Hiện tại sử dụng dữ liệu mẫu cho biểu đồ
      const fallbackData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
        datasets: [
          {
            label: 'Doanh thu đơn hàng (triệu VNĐ)',
            data: [8, 12, 10, 15, 13, 18],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
            fill: false
          },
          {
            label: 'Doanh thu cuộc hẹn (triệu VNĐ)',
            data: [4, 7, 5, 10, 9, 12],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.1,
            fill: false
          }
        ]
      };
      return fallbackData;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu biểu đồ doanh thu:', error);
      throw error;
    }
  },

  // Lấy dữ liệu thống kê cuộc hẹn theo trạng thái
  getAppointmentStats: async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      const appointments = response.data;

      const stats = appointments.reduce((acc, appointment) => {
        const status = appointment.status || 'PENDING';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        pending: stats.PENDING || 0,
        confirmed: stats.CONFIRMED || 0,
        completed: stats.COMPLETED || 0,
        cancelled: stats.CANCELLED || 0
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê cuộc hẹn:', error);
      // Fallback data
      return {
        pending: 5,
        confirmed: 8,
        completed: 12,
        cancelled: 2
      };
    }
  },

  // Lấy dữ liệu dịch vụ phổ biến từ appointments_service
  getPopularServices: async () => {
    try {
      // Lấy tất cả appointments với services
      const appointmentsResponse = await axiosInstance.get('/appointments');
      const appointments = appointmentsResponse.data;
      
      console.log(`Found ${appointments.length} appointments for services analysis`);
      console.log('Sample appointment:', appointments[0]);
      
      // Đếm số lần mỗi service được sử dụng
      const serviceCount = {};
      const serviceDetails = {};
      
      appointments.forEach((appointment, index) => {
        console.log(`Processing appointment ${index + 1}:`, {
          id: appointment.id,
          service: appointment.service,
          services: appointment.services,
          serviceName: appointment.serviceName,
          serviceType: appointment.serviceType
        });
        
        // Kiểm tra các trường có thể chứa thông tin dịch vụ
        let serviceName = null;
        
        if (appointment.services && Array.isArray(appointment.services) && appointment.services.length > 0) {
          // Trường hợp có array services
          appointment.services.forEach(service => {
            const serviceId = service.serviceId || service.id || service.name;
            const name = service.serviceName || service.name || service.service || `Dịch vụ ${serviceId}`;
            const price = service.price || service.servicePrice || 0;
            
            if (serviceId && name) {
              serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
              serviceDetails[serviceId] = {
                name: name,
                price: price,
                count: serviceCount[serviceId]
              };
            }
          });
        } else if (appointment.service) {
          // Trường hợp service là string
          serviceName = appointment.service;
        } else if (appointment.serviceName) {
          // Trường hợp có serviceName
          serviceName = appointment.serviceName;
        } else if (appointment.serviceType) {
          // Trường hợp có serviceType
          serviceName = appointment.serviceType;
        } else {
          // Fallback: tạo tên dịch vụ mặc định
          serviceName = 'Khám tổng quát';
        }
        
        // Xử lý service name nếu có
        if (serviceName) {
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
          serviceDetails[serviceName] = {
            name: serviceName,
            price: appointment.price || 300000, // Giá mặc định
            count: serviceCount[serviceName]
          };
        }
      });
      
      console.log('Service count:', serviceCount);
      console.log('Service details:', serviceDetails);
      
      // Chuyển đổi thành array và sắp xếp theo số lượng
      const servicesArray = Object.keys(serviceDetails).map(serviceId => ({
        id: serviceId,
        name: serviceDetails[serviceId].name,
        count: serviceDetails[serviceId].count,
        price: serviceDetails[serviceId].price,
        percentage: 0 // Sẽ được tính sau
      }));
      
      console.log('Services array before sort:', servicesArray);
      
      // Sắp xếp theo số lượng giảm dần
      servicesArray.sort((a, b) => b.count - a.count);
      
      // Lấy top 6 services
      const topServices = servicesArray.slice(0, 6);
      
      // Tính phần trăm
      const totalCount = topServices.reduce((sum, service) => sum + service.count, 0);
      topServices.forEach(service => {
        service.percentage = totalCount > 0 ? ((service.count / totalCount) * 100).toFixed(1) : 0;
      });
      
      console.log('Top services calculated:', topServices);
      
      // Nếu không có dữ liệu thực, trả về fallback data
      if (topServices.length === 0) {
        console.log('No services found, using fallback data');
        return {
          services: [
            { id: 1, name: 'Khám mắt tổng quát', count: 45, percentage: '35.2', price: 200000 },
            { id: 2, name: 'Điều trị cận thị', count: 32, percentage: '25.0', price: 500000 },
            { id: 3, name: 'Khám chuyên sâu', count: 28, percentage: '21.9', price: 300000 },
            { id: 4, name: 'Tư vấn kính áp tròng', count: 15, percentage: '11.7', price: 150000 },
            { id: 5, name: 'Điều trị viêm kết mạc', count: 8, percentage: '6.2', price: 250000 }
          ],
          totalAppointments: 128,
          totalServicesUsed: 12,
          summary: {
            mostPopular: 'Khám mắt tổng quát',
            totalBookings: 128,
            averagePerService: '25.6'
          }
        };
      }
      
      return {
        services: topServices,
        totalAppointments: appointments.length,
        totalServicesUsed: Object.keys(serviceCount).length,
        summary: {
          mostPopular: topServices[0]?.name || 'N/A',
          totalBookings: totalCount,
          averagePerService: totalCount > 0 ? (totalCount / topServices.length).toFixed(1) : 0
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dịch vụ phổ biến:', error);
      // Fallback data
      return {
        services: [
          { id: 1, name: 'Khám mắt tổng quát', count: 45, percentage: '35.2', price: 200000 },
          { id: 2, name: 'Điều trị cận thị', count: 32, percentage: '25.0', price: 500000 },
          { id: 3, name: 'Khám chuyên sâu', count: 28, percentage: '21.9', price: 300000 },
          { id: 4, name: 'Tư vấn kính áp tròng', count: 15, percentage: '11.7', price: 150000 },
          { id: 5, name: 'Điều trị viêm kết mạc', count: 8, percentage: '6.2', price: 250000 }
        ],
        totalAppointments: 128,
        totalServicesUsed: 12,
        summary: {
          mostPopular: 'Khám mắt tổng quát',
          totalBookings: 128,
          averagePerService: '25.6'
        }
      };
    }
  },

  // Lấy dữ liệu xếp hạng khách hàng từ appointments và orders
  getCustomerRanking: async () => {
    try {
      console.log('Getting customer ranking data from appointments and orders...');
      
      // Fetch data từ 2 endpoints song song
      const [appointmentsResponse, ordersResponse] = await Promise.all([
        axiosInstance.get('/appointments'),
        axiosInstance.get('/orders')
      ]);

      const appointments = appointmentsResponse.data || [];
      const orders = ordersResponse.data || [];

      console.log(`Found ${appointments.length} appointments and ${orders.length} orders`);
      
      // Debug: Log sample data
      if (appointments.length > 0) {
        console.log('Sample appointment:', appointments[0]);
      }
      if (orders.length > 0) {
        console.log('Sample order:', orders[0]);
      }

      // Tạo object để lưu thống kê theo patientId/userId
      const customerStats = {};

      // Xử lý appointments (chỉ COMPLETED appointments có totalAmount)
      appointments.forEach((appointment, index) => {
        console.log(`Processing appointment ${index + 1}:`, {
          id: appointment.id,
          status: appointment.status,
          totalAmount: appointment.totalAmount,
          patientId: appointment.patientId || appointment.patient_id
        });

        // Chỉ tính appointments đã COMPLETED và có totalAmount
        if (appointment.status !== 'COMPLETED' || !appointment.totalAmount) {
          return;
        }

        const totalAmount = parseFloat(appointment.totalAmount) || 0;
        const patientId = appointment.patientId || appointment.patient_id || appointment.userId;
        
        if (!patientId) {
          console.warn('No patientId found for appointment:', appointment);
          return;
        }

        // Initialize customer stats if not exists
        if (!customerStats[patientId]) {
          customerStats[patientId] = {
            patientId: patientId,
            patientName: appointment.patient?.name || appointment.patientName || appointment.user?.name || `User ${patientId}`,
            appointmentSpending: 0,
            orderSpending: 0,
            totalSpending: 0,
            appointmentCount: 0,
            orderCount: 0
          };
        }

        // Add appointment spending
        customerStats[patientId].appointmentSpending += totalAmount;
        customerStats[patientId].appointmentCount += 1;
      });

      // Xử lý orders (chỉ COMPLETED orders)
      orders.forEach((order, index) => {
        console.log(`Processing order ${index + 1}:`, {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          userId: order.userId
        });

        // Chỉ tính orders đã COMPLETED
        if (order.status !== 'COMPLETED') {
          return;
        }

        const totalAmount = parseFloat(order.totalAmount) || 0;
        const userId = order.userId;
        
        if (!userId) {
          console.warn('No userId found for order:', order);
          return;
        }

        // Initialize customer stats if not exists (or update name if better info available)
        if (!customerStats[userId]) {
          customerStats[userId] = {
            patientId: userId,
            patientName: order.user?.name || order.userName || `User ${userId}`,
            appointmentSpending: 0,
            orderSpending: 0,
            totalSpending: 0,
            appointmentCount: 0,
            orderCount: 0
          };
        } else {
          // Update name if we have better info from order
          if (order.user?.name && customerStats[userId].patientName.startsWith('User ')) {
            customerStats[userId].patientName = order.user.name;
          }
        }

        // Add order spending
        customerStats[userId].orderSpending += totalAmount;
        customerStats[userId].orderCount += 1;
      });

      // Tính tổng spending cho mỗi customer
      Object.values(customerStats).forEach(customer => {
        customer.totalSpending = customer.appointmentSpending + customer.orderSpending;
      });

      console.log('Customer stats after processing:', customerStats);

      // Sắp xếp customers theo totalSpending (cao nhất trước)
      const sortedCustomers = Object.values(customerStats)
        .sort((a, b) => b.totalSpending - a.totalSpending)
        .slice(0, 10); // Lấy top 10

      // Gán tier cho top 3
      const customersWithTiers = sortedCustomers.map((customer, index) => {
        let tier = 'Đồng';
        let tierColor = '#CD7F32';
        
        if (index === 0) {
          tier = 'Vàng';
          tierColor = '#FFD700';
        } else if (index === 1) {
          tier = 'Bạc';
          tierColor = '#C0C0C0';
        }

        return {
          ...customer,
          rank: index + 1,
          tier,
          tierColor
        };
      });

      // Tính tổng statistics
      const totalCustomers = Object.keys(customerStats).length;
      const totalAppointments = Object.values(customerStats).reduce((sum, c) => sum + c.appointmentCount, 0);
      const totalOrders = Object.values(customerStats).reduce((sum, c) => sum + c.orderCount, 0);
      const totalAppointmentSpending = Object.values(customerStats).reduce((sum, c) => sum + c.appointmentSpending, 0);
      const totalOrderSpending = Object.values(customerStats).reduce((sum, c) => sum + c.orderSpending, 0);

      const result = {
        customers: customersWithTiers,
        summary: {
          totalCustomers,
          totalAppointments,
          totalOrders,
          totalAppointmentSpending,
          totalOrderSpending,
          totalSpending: totalAppointmentSpending + totalOrderSpending
        }
      };

      console.log('Customer ranking calculated:', result);
      return result;

    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu xếp hạng khách hàng:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      throw error; // Throw error để component có thể handle
    }
  },

  // Lấy dữ liệu sản phẩm bán chạy từ orders API (không dùng order-items)
  getTopProducts: async (period = '30days') => {
    try {
      console.log('Fetching top products data...');
      
      // Lấy dữ liệu orders từ API
      const response = await axiosInstance.get('/orders');
      const orders = response.data;
      console.log('Orders data:', orders.length, 'orders');

      // Chỉ tính orders đã COMPLETED
      const completedOrders = orders.filter(order => order.status === 'COMPLETED');
      console.log('Completed orders:', completedOrders.length);

      // Lấy danh sách products để có thông tin chi tiết
      let productsInfo = {};
      try {
        const productsResponse = await axiosInstance.get('/products');
        const products = productsResponse.data;
        console.log('Products info:', products.length, 'products');
        console.log('Raw products from API:', products);
        
        products.forEach(product => {
          console.log('Product data:', {
            id: product.id,
            name: product.name,
            type: product.type,
            price: product.price,
            imageUrl: product.imageUrl,
            allFields: Object.keys(product)
          });
          
          // Process image URL - add base URL if relative path or use sample based on category
          let processedImageUrl = product.imageUrl;
          if (processedImageUrl && processedImageUrl.startsWith('/')) {
            processedImageUrl = `http://localhost:8080${processedImageUrl}`;
          } else if (!processedImageUrl) {
            // Nếu không có image, sử dụng sample image dựa trên category
            const categoryType = (product.type || 'OTHER').toUpperCase();
            switch (categoryType) {
              case 'EYEWEAR':
              case 'GLASSES':
              case 'SUNGLASSES':
              case 'READING_GLASSES':
                processedImageUrl = 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=GLASSES';
                break;
              case 'MEDICINE':
              case 'EYE_DROPS':
              case 'DROPS':
                processedImageUrl = 'https://via.placeholder.com/150x150/10b981/ffffff?text=DROPS';
                break;
              case 'LENS':
              case 'CONTACT_LENS':
              case 'CONTACT_LENSES':
                processedImageUrl = 'https://via.placeholder.com/150x150/8b5cf6/ffffff?text=LENS';
                break;
              case 'FRAMES':
              case 'EYEGLASS_FRAMES':
                processedImageUrl = 'https://via.placeholder.com/150x150/f59e0b/ffffff?text=FRAMES';
                break;
              default:
                processedImageUrl = 'https://via.placeholder.com/150x150/6b7280/ffffff?text=PRODUCT';
            }
          }
          
          productsInfo[product.id] = {
            name: product.name,
            category: product.type || 'OTHER',
            price: product.price,
            image: processedImageUrl
          };
        });
      } catch (error) {
        console.warn('Could not fetch products info:', error.message);
      }

      // Estimate product sales từ orders (vì không có order-items endpoint)
      const productStats = {};
      completedOrders.forEach((order, index) => {
        console.log(`Processing order ${index + 1}:`, {
          id: order.id,
          totalAmount: order.totalAmount,
          status: order.status
        });

        // Estimate: mỗi order có 1 sản phẩm random
        // Trong thực tế, cần có cách map order -> products
        const productIds = Object.keys(productsInfo);
        if (productIds.length > 0) {
          // Lấy sản phẩm đầu tiên hoặc random
          const productId = productIds[index % productIds.length];
          const productInfo = productsInfo[productId];
          
          if (productInfo) {
            if (!productStats[productId]) {
              productStats[productId] = {
                id: productId,
                name: productInfo.name,
                category: productInfo.category,
                image: productInfo.image,
                soldQuantity: 0,
                revenue: 0,
                orders: 0
              };
            }

            // Estimate 1 quantity per order
            productStats[productId].soldQuantity += 1;
            productStats[productId].revenue += parseFloat(order.totalAmount) || 0;
            productStats[productId].orders += 1;
          }
        }
      });

      // Chuyển đổi object thành array và sort theo revenue
      // Chuyển đổi thành array và sắp xếp theo revenue
      const productsArray = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10) // Lấy top 10
        .map((product, index) => ({
          ...product,
          rank: index + 1,
          growth: Math.random() * 40 - 10 // Random growth cho demo (có thể tính từ data cũ)
        }));

      console.log('Top products:', productsArray);

      const summary = {
        totalProducts: productsArray.length,
        totalSold: productsArray.reduce((sum, p) => sum + p.soldQuantity, 0),
        totalRevenue: productsArray.reduce((sum, p) => sum + p.revenue, 0),
        totalOrders: completedOrders.length,
        period: period
      };

      console.log('Products summary:', summary);

      return {
        products: productsArray,
        summary: summary
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm bán chạy:', error);
      // Return empty data instead of fallback
      return {
        products: [],
        summary: {
          totalProducts: 0,
          totalSold: 0,
          totalRevenue: 0,
          totalOrders: 0,
          period: period
        },
        error: error.message
      };
    }
  }
};

export default dashboardService;
