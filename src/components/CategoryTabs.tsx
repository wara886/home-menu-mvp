"use client";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onChange }: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-stone-200 bg-[#fff8f1]/95 px-4 py-3 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["全部", ...categories].map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-medium transition ${
                isActive
                  ? "bg-[#202124] text-white shadow-sm"
                  : "bg-white text-stone-700 ring-1 ring-stone-200"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
