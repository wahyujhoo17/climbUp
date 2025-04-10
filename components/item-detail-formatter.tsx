import React from "react";

interface ItemDetailFormatterProps {
  items: string[] | string;
  type: "responsibilities" | "qualifications" | "benefits";
}

export const ItemDetailFormatter: React.FC<ItemDetailFormatterProps> = ({
  items,
  type,
}) => {
  // Jika items adalah string, konversikan menjadi array
  let itemArray: string[] = [];

  if (typeof items === "string") {
    // Coba deteksi bullet points dalam string
    if (items.includes("• ") || items.includes("* ") || items.includes("- ")) {
      itemArray = items
        .split(/(?:^|\n)(?:• |\* |- )/)
        .filter((item) => item.trim().length > 0);
    } else {
      // Jika tidak ada bullet points, split berdasarkan newline
      itemArray = items.split("\n").filter((item) => item.trim().length > 0);
    }
  } else if (Array.isArray(items)) {
    itemArray = items;
  }

  // Jika masih kosong, berikan feedback
  if (itemArray.length === 0) {
    return (
      <p className="text-muted-foreground italic">
        No {type} information available.
      </p>
    );
  }

  return (
    <ul className="list-disc pl-5 space-y-2.5">
      {itemArray.map((item, i) => (
        <li key={i} className="text-muted-foreground">
          {item.trim()}
        </li>
      ))}
    </ul>
  );
};
