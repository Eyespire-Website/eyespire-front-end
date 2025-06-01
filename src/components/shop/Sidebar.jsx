"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

export default function Sidebar() {
  const [priceRange, setPriceRange] = useState([105, 390])

  const colorOptions = [
    { name: "Black", value: "black", color: "bg-black" },
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "White", value: "white", color: "bg-white border border-gray-300" },
    { name: "Clear", value: "clear", color: "bg-gray-100" },
  ]

  return (
    <div className="lg:w-1/4">
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-3">Categories</h3>
          <div className="space-y-2">
            {["Aspheric", "High Index Plastic", "Photochromic", "Aspheric"].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox id={category} />
                <label htmlFor={category} className="text-sm">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <h3 className="font-semibold mb-3">Colours</h3>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                className={`w-6 h-6 rounded-full ${color.color} border-2 border-gray-200 hover:border-blue-500`}
                title={color.name}
              />
            ))}
          </div>
          <button className="text-blue-600 text-sm mt-2">Clear</button>
        </div>

        {/* Gender */}
        <div>
          <h3 className="font-semibold mb-3">Gender</h3>
          <div className="space-y-2">
            {["Men", "Unisex", "Women"].map((gender) => (
              <div key={gender} className="flex items-center space-x-2">
                <Checkbox id={gender} />
                <label htmlFor={gender} className="text-sm">
                  {gender}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Frame Shapes */}
        <div>
          <h3 className="font-semibold mb-3">Frame Shapes</h3>
          <div className="space-y-2">
            {["Hexagonal", "Rectangle", "Square", "Oval"].map((shape) => (
              <div key={shape} className="flex items-center space-x-2">
                <Checkbox id={shape} />
                <label htmlFor={shape} className="text-sm">
                  {shape}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Frame Width */}
        <div>
          <h3 className="font-semibold mb-3">Frame Width</h3>
          <div className="space-y-2">
            {["Narrow", "Medium", "Wide"].map((width) => (
              <div key={width} className="flex items-center space-x-2">
                <Checkbox id={width} />
                <label htmlFor={width} className="text-sm">
                  {width}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {["Contact lens", "Help", "Optometric", "Metal", "Gradient", "Diamond", "Professional"].map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-semibold mb-3">Price range</h3>
          <div className="space-y-4">
            <Slider value={priceRange} onValueChange={setPriceRange} max={390} min={105} step={1} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>From ${priceRange[0]}</span>
              <span>to ${priceRange[1]}</span>
            </div>
          </div>
          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Apply Filter</Button>
        </div>
      </div>
    </div>
  )
}
