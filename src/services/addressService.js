
import axios from 'axios';

/**
 * Service xử lý API địa chỉ theo cải cách hành chính Việt Nam
 * API mới: 2 cấp (Tỉnh → Phường/Xã) thay vì 3 cấp cũ
 */
class AddressService {
    constructor() {
        this.API_URL = 'https://vietnamlabs.com/api/vietnamprovince';
        this.cache = {
            provinces: null,
            wards: new Map()
        };
    }

    /**
     * Lấy danh sách tất cả tỉnh/thành phố
     * @returns {Promise<Array>} Danh sách tỉnh/thành phố
     */
    async getProvinces() {
        try {
            // Kiểm tra cache
            if (this.cache.provinces) {
                return this.cache.provinces;
            }

            const response = await axios.get(this.API_URL);
            
            if (response.data.success) {
                const provinces = response.data.data.map(province => ({
                    id: province.id,
                    name: province.province,
                    code: province.id
                }));
                
                // Lưu vào cache
                this.cache.provinces = provinces;
                return provinces;
            } else {
                throw new Error('API trả về không thành công');
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
            throw new Error('Không thể lấy danh sách tỉnh/thành phố. Vui lòng thử lại.');
        }
    }

    /**
     * Lấy danh sách phường/xã theo tỉnh
     * @param {string} provinceId ID của tỉnh
     * @returns {Promise<Array>} Danh sách phường/xã
     */
    async getWardsByProvince(provinceId) {
        try {
            // Kiểm tra cache
            const cacheKey = `province_${provinceId}`;
            if (this.cache.wards.has(cacheKey)) {
                return this.cache.wards.get(cacheKey);
            }

            const response = await axios.get(this.API_URL);
            
            if (response.data.success) {
                const province = response.data.data.find(p => p.id === provinceId);
                
                if (!province) {
                    throw new Error('Không tìm thấy tỉnh/thành phố');
                }

                const wards = province.wards.map((ward, index) => ({
                    id: `${provinceId}_${index + 1}`,
                    name: ward.name,
                    mergedFrom: ward.mergedFrom || [],
                    provinceId: provinceId
                }));

                // Lưu vào cache
                this.cache.wards.set(cacheKey, wards);
                return wards;
            } else {
                throw new Error('API trả về không thành công');
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phường/xã:', error);
            throw new Error('Không thể lấy danh sách phường/xã. Vui lòng thử lại.');
        }
    }

    /**
     * Tìm kiếm phường/xã theo tên (hỗ trợ migration dữ liệu cũ)
     * @param {string} wardName Tên phường/xã cần tìm
     * @param {string} provinceId ID tỉnh (optional)
     * @returns {Promise<Object|null>} Thông tin phường/xã hoặc null
     */
    async findWardByName(wardName, provinceId = null) {
        try {
            const response = await axios.get(this.API_URL);
            
            if (!response.data.success) {
                return null;
            }

            const provinces = provinceId 
                ? response.data.data.filter(p => p.id === provinceId)
                : response.data.data;

            for (const province of provinces) {
                for (const ward of province.wards) {
                    // Tìm trong tên hiện tại
                    if (ward.name.toLowerCase().includes(wardName.toLowerCase())) {
                        return {
                            id: `${province.id}_${province.wards.indexOf(ward) + 1}`,
                            name: ward.name,
                            provinceName: province.province,
                            provinceId: province.id,
                            mergedFrom: ward.mergedFrom || []
                        };
                    }

                    // Tìm trong danh sách đã sáp nhập
                    if (ward.mergedFrom) {
                        for (const oldName of ward.mergedFrom) {
                            if (oldName.toLowerCase().includes(wardName.toLowerCase())) {
                                return {
                                    id: `${province.id}_${province.wards.indexOf(ward) + 1}`,
                                    name: ward.name,
                                    provinceName: province.province,
                                    provinceId: province.id,
                                    mergedFrom: ward.mergedFrom,
                                    foundInMerged: oldName
                                };
                            }
                        }
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm phường/xã:', error);
            return null;
        }
    }

    /**
     * Lấy tên tỉnh theo ID
     * @param {string} provinceId ID của tỉnh
     * @returns {Promise<string|null>} Tên tỉnh hoặc null
     */
    async getProvinceName(provinceId) {
        try {
            const provinces = await this.getProvinces();
            const province = provinces.find(p => p.id === provinceId);
            return province ? province.name : null;
        } catch (error) {
            console.error('Lỗi khi lấy tên tỉnh:', error);
            return null;
        }
    }

    /**
     * Lấy tên phường/xã theo ID
     * @param {string} wardId ID của phường/xã
     * @returns {Promise<string|null>} Tên phường/xã hoặc null
     */
    async getWardName(wardId) {
        try {
            const [provinceId] = wardId.split('_');
            const wards = await this.getWardsByProvince(provinceId);
            const ward = wards.find(w => w.id === wardId);
            return ward ? ward.name : null;
        } catch (error) {
            console.error('Lỗi khi lấy tên phường/xã:', error);
            return null;
        }
    }

    /**
     * Xóa cache (dùng khi cần refresh dữ liệu)
     */
    clearCache() {
        this.cache.provinces = null;
        this.cache.wards.clear();
    }

    /**
     * Kiểm tra và migrate địa chỉ cũ (3 cấp) sang mới (2 cấp)
     * @param {Object} oldAddress Địa chỉ cũ {province, district, ward}
     * @returns {Promise<Object>} Địa chỉ mới {province, ward}
     */
    async migrateOldAddress(oldAddress) {
        try {
            const { province, district, ward } = oldAddress;
            
            // Tìm tỉnh
            const provinces = await this.getProvinces();
            const foundProvince = provinces.find(p => 
                p.name.toLowerCase().includes(province?.toLowerCase() || '')
            );

            if (!foundProvince) {
                return { province: null, ward: null, migrationNote: 'Không tìm thấy tỉnh' };
            }

            // Tìm phường/xã (ưu tiên tìm theo tên ward, fallback sang district)
            let foundWard = null;
            
            if (ward) {
                foundWard = await this.findWardByName(ward, foundProvince.id);
            }
            
            if (!foundWard && district) {
                foundWard = await this.findWardByName(district, foundProvince.id);
            }

            return {
                province: foundProvince.id,
                ward: foundWard?.id || null,
                migrationNote: foundWard ? 
                    (foundWard.foundInMerged ? `Đã sáp nhập từ: ${foundWard.foundInMerged}` : 'Migration thành công') 
                    : 'Không tìm thấy phường/xã tương ứng'
            };
        } catch (error) {
            console.error('Lỗi khi migrate địa chỉ:', error);
            return { province: null, ward: null, migrationNote: 'Lỗi migration' };
        }
    }
}

// Export singleton instance
const addressService = new AddressService();
export default addressService;
