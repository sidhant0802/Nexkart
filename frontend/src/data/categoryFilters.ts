// src/data/categoryFilters.ts

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  key:     string;       // matches backend query param
  label:   string;       // display name
  type:    "checkbox" | "color-swatch";
  options: FilterOption[];
}

// ── Map categoryId → filter groups
export const CATEGORY_FILTERS: Record<string, FilterGroup[]> = {

  // ── ELECTRONICS (parent)
  electronics: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Apple",   value: "Apple"   },
        { label: "Samsung", value: "Samsung" },
        { label: "Sony",    value: "Sony"    },
        { label: "OnePlus", value: "OnePlus" },
        { label: "Dell",    value: "Dell"    },
        { label: "Dyson",   value: "Dyson"   },
        { label: "Nike",    value: "Nike"    },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹10,000",          value: "0-10000"      },
        { label: "₹10,000 – ₹30,000",      value: "10000-30000"  },
        { label: "₹30,000 – ₹80,000",      value: "30000-80000"  },
        { label: "₹80,000 – ₹1,50,000",    value: "80000-150000" },
        { label: "Above ₹1,50,000",        value: "150000-999999"},
      ],
    },
    {
      key:   "minDiscount",
      label: "Discount",
      type:  "checkbox",
      options: [
        { label: "10% and above", value: "10" },
        { label: "20% and above", value: "20" },
        { label: "30% and above", value: "30" },
      ],
    },
  ],

  // ── MOBILES
  mobiles: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Apple",   value: "Apple"   },
        { label: "Samsung", value: "Samsung" },
        { label: "OnePlus", value: "OnePlus" },
        { label: "Xiaomi",  value: "Xiaomi"  },
        { label: "Vivo",    value: "Vivo"    },
        { label: "Oppo",    value: "Oppo"    },
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "Black",    value: "Black"    },
        { label: "White",    value: "White"    },
        { label: "Blue",     value: "Blue"     },
        { label: "Gold",     value: "Gold"     },
        { label: "Titanium", value: "Titanium" },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹15,000",       value: "0-15000"      },
        { label: "₹15,000 – ₹30,000",   value: "15000-30000"  },
        { label: "₹30,000 – ₹60,000",   value: "30000-60000"  },
        { label: "Above ₹60,000",        value: "60000-999999" },
      ],
    },
    {
      key:   "minDiscount",
      label: "Discount",
      type:  "checkbox",
      options: [
        { label: "10% and above", value: "10" },
        { label: "20% and above", value: "20" },
      ],
    },
  ],

  // ── LAPTOPS
  laptops: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Apple",   value: "Apple"   },
        { label: "Dell",    value: "Dell"    },
        { label: "HP",      value: "HP"      },
        { label: "Lenovo",  value: "Lenovo"  },
        { label: "Asus",    value: "Asus"    },
        { label: "Acer",    value: "Acer"    },
        { label: "MSI",     value: "MSI"     },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹40,000",        value: "0-40000"       },
        { label: "₹40,000 – ₹80,000",    value: "40000-80000"   },
        { label: "₹80,000 – ₹1,50,000",  value: "80000-150000"  },
        { label: "Above ₹1,50,000",       value: "150000-999999" },
      ],
    },
    {
      key:   "minDiscount",
      label: "Discount",
      type:  "checkbox",
      options: [
        { label: "10% and above", value: "10" },
        { label: "20% and above", value: "20" },
      ],
    },
  ],

  // ── HEADPHONES
  headphones_headsets: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Sony",    value: "Sony"    },
        { label: "Apple",   value: "Apple"   },
        { label: "Bose",    value: "Bose"    },
        { label: "JBL",     value: "JBL"     },
        { label: "Sennheiser", value: "Sennheiser" },
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "Black", value: "Black" },
        { label: "White", value: "White" },
        { label: "Silver",value: "Silver"},
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹5,000",       value: "0-5000"      },
        { label: "₹5,000 – ₹15,000",   value: "5000-15000"  },
        { label: "₹15,000 – ₹30,000",  value: "15000-30000" },
        { label: "Above ₹30,000",       value: "30000-999999"},
      ],
    },
  ],

  // ── SMART WATCHES
  smart_watches: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Apple",   value: "Apple"   },
        { label: "Samsung", value: "Samsung" },
        { label: "Garmin",  value: "Garmin"  },
        { label: "Fitbit",  value: "Fitbit"  },
        { label: "Noise",   value: "Noise"   },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹5,000",       value: "0-5000"      },
        { label: "₹5,000 – ₹20,000",   value: "5000-20000"  },
        { label: "₹20,000 – ₹50,000",  value: "20000-50000" },
        { label: "Above ₹50,000",       value: "50000-999999"},
      ],
    },
  ],

  // ── MEN (parent)
  men: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Levi's",       value: "Levi"        },
        { label: "Allen Solly",  value: "Allen Solly" },
        { label: "Nike",         value: "Nike"        },
        { label: "Adidas",       value: "Adidas"      },
        { label: "Puma",         value: "Puma"        },
        { label: "H&M",          value: "H&M"         },
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "Black",  value: "Black"  },
        { label: "White",  value: "White"  },
        { label: "Blue",   value: "Blue"   },
        { label: "Grey",   value: "Grey"   },
        { label: "Brown",  value: "Brown"  },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹1,000",      value: "0-1000"      },
        { label: "₹1,000 – ₹3,000",   value: "1000-3000"   },
        { label: "₹3,000 – ₹7,000",   value: "3000-7000"   },
        { label: "Above ₹7,000",       value: "7000-999999" },
      ],
    },
    {
      key:   "minDiscount",
      label: "Discount",
      type:  "checkbox",
      options: [
        { label: "20% and above", value: "20" },
        { label: "30% and above", value: "30" },
        { label: "40% and above", value: "40" },
      ],
    },
  ],

  // ── MEN TOPWEAR
  men_topwear: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Allen Solly", value: "Allen Solly" },
        { label: "Levi's",      value: "Levi"        },
        { label: "H&M",         value: "H&M"         },
        { label: "Zara",        value: "Zara"        },
        { label: "Peter England",value: "Peter"      },
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "White",  value: "White"  },
        { label: "Blue",   value: "Blue"   },
        { label: "Black",  value: "Black"  },
        { label: "Grey",   value: "Grey"   },
        { label: "Green",  value: "Green"  },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹500",       value: "0-500"      },
        { label: "₹500 – ₹1,500",    value: "500-1500"   },
        { label: "₹1,500 – ₹3,000",  value: "1500-3000"  },
        { label: "Above ₹3,000",      value: "3000-999999"},
      ],
    },
  ],

  // ── MEN FOOTWEAR
  men_footwear: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Nike",    value: "Nike"    },
        { label: "Adidas",  value: "Adidas"  },
        { label: "Puma",    value: "Puma"    },
        { label: "Reebok",  value: "Reebok"  },
        { label: "Bata",    value: "Bata"    },
        { label: "Sketchers",value: "Sketchers"},
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "White",  value: "White"  },
        { label: "Black",  value: "Black"  },
        { label: "Brown",  value: "Brown"  },
        { label: "Grey",   value: "Grey"   },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹2,000",      value: "0-2000"      },
        { label: "₹2,000 – ₹5,000",   value: "2000-5000"   },
        { label: "₹5,000 – ₹10,000",  value: "5000-10000"  },
        { label: "Above ₹10,000",      value: "10000-999999"},
      ],
    },
    {
      key:   "minDiscount",
      label: "Discount",
      type:  "checkbox",
      options: [
        { label: "20% and above", value: "20" },
        { label: "30% and above", value: "30" },
      ],
    },
  ],

  // ── WOMEN (parent)
  women: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Zara",    value: "Zara"    },
        { label: "H&M",     value: "H&M"     },
        { label: "Kalini",  value: "Kalini"  },
        { label: "W",       value: " W "     },
        { label: "Biba",    value: "Biba"    },
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "Red",     value: "Red"     },
        { label: "Blue",    value: "Blue"    },
        { label: "Green",   value: "Green"   },
        { label: "Yellow",  value: "Yellow"  },
        { label: "Pink",    value: "Pink"    },
        { label: "Black",   value: "Black"   },
        { label: "White",   value: "White"   },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹1,000",      value: "0-1000"      },
        { label: "₹1,000 – ₹3,000",   value: "1000-3000"   },
        { label: "₹3,000 – ₹8,000",   value: "3000-8000"   },
        { label: "Above ₹8,000",       value: "8000-999999" },
      ],
    },
  ],

  // ── WOMEN SAREES
  women_sarees: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Kalini",   value: "Kalini"  },
        { label: "Saree Mall",value: "Saree"  },
        { label: "Pothys",   value: "Pothys"  },
        { label: "Fabindia", value: "Fabindia"},
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "Red",      value: "Red"     },
        { label: "Blue",     value: "Blue"    },
        { label: "Green",    value: "Green"   },
        { label: "Crimson",  value: "Crimson" },
        { label: "Pink",     value: "Pink"    },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹2,000",      value: "0-2000"      },
        { label: "₹2,000 – ₹5,000",   value: "2000-5000"   },
        { label: "₹5,000 – ₹10,000",  value: "5000-10000"  },
        { label: "Above ₹10,000",      value: "10000-999999"},
      ],
    },
  ],

  // ── WOMEN WESTERN
  women_western_wear: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "Zara",     value: "Zara"    },
        { label: "H&M",      value: "H&M"     },
        { label: "Forever 21",value: "Forever"},
        { label: "Mango",    value: "Mango"   },
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "Black",      value: "Black"      },
        { label: "White",      value: "White"      },
        { label: "Multicolor", value: "Multicolor" },
        { label: "Blue",       value: "Blue"       },
        { label: "Pink",       value: "Pink"       },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹1,500",      value: "0-1500"      },
        { label: "₹1,500 – ₹4,000",   value: "1500-4000"   },
        { label: "₹4,000 – ₹8,000",   value: "4000-8000"   },
        { label: "Above ₹8,000",       value: "8000-999999" },
      ],
    },
  ],

  // ── HOME & FURNITURE
  home_furniture: [
    {
      key:   "brand",
      label: "Brand",
      type:  "checkbox",
      options: [
        { label: "IKEA",     value: "IKEA"    },
        { label: "Dyson",    value: "Dyson"   },
        { label: "Urban Ladder",value: "Urban"},
        { label: "Pepperfry",value: "Pepper"  },
        { label: "HomeTown", value: "Home"    },
      ],
    },
    {
      key:   "color",
      label: "Color",
      type:  "color-swatch",
      options: [
        { label: "White",  value: "White"  },
        { label: "Brown",  value: "Brown"  },
        { label: "Black",  value: "Black"  },
        { label: "Grey",   value: "Grey"   },
      ],
    },
    {
      key:   "minPrice,maxPrice",
      label: "Price Range",
      type:  "checkbox",
      options: [
        { label: "Under ₹5,000",        value: "0-5000"        },
        { label: "₹5,000 – ₹20,000",    value: "5000-20000"    },
        { label: "₹20,000 – ₹50,000",   value: "20000-50000"   },
        { label: "Above ₹50,000",        value: "50000-999999"  },
      ],
    },
    {
      key:   "minDiscount",
      label: "Discount",
      type:  "checkbox",
      options: [
        { label: "10% and above", value: "10" },
        { label: "20% and above", value: "20" },
      ],
    },
  ],
};

// ── Fallback filters for unknown categories
export const DEFAULT_FILTERS: FilterGroup[] = [
  {
    key:   "color",
    label: "Color",
    type:  "color-swatch",
    options: [
      { label: "Black",  value: "Black"  },
      { label: "White",  value: "White"  },
      { label: "Red",    value: "Red"    },
      { label: "Blue",   value: "Blue"   },
      { label: "Green",  value: "Green"  },
      { label: "Grey",   value: "Grey"   },
    ],
  },
  {
    key:   "minPrice,maxPrice",
    label: "Price Range",
    type:  "checkbox",
    options: [
      { label: "Under ₹5,000",       value: "0-5000"      },
      { label: "₹5,000 – ₹10,000",   value: "5000-10000"  },
      { label: "₹10,000 – ₹20,000",  value: "10000-20000" },
      { label: "Above ₹20,000",       value: "20000-999999"},
    ],
  },
];

// ── Color hex map for swatches
export const COLOR_HEX: Record<string, string> = {
  Black:      "#111111",
  White:      "#f5f5f5",
  Red:        "#ef4444",
  Blue:       "#3b82f6",
  Green:      "#22c55e",
  Grey:       "#6b7280",
  Brown:      "#92400e",
  Yellow:     "#eab308",
  Gold:       "#f59e0b",
  Pink:       "#ec4899",
  Silver:     "#c0c0c0",
  Titanium:   "#878681",
  Crimson:    "#dc143c",
  Multicolor: "linear-gradient(135deg, #ef4444, #3b82f6, #22c55e)",
};