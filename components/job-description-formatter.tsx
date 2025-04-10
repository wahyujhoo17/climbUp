import React from "react";

interface JobDescriptionFormatterProps {
  description: string;
}

export const JobDescriptionFormatter: React.FC<
  JobDescriptionFormatterProps
> = ({ description }) => {
  // Periksa jika deskripsi mengandung bullet points (•) atau format list lainnya
  const containsBulletPoints =
    description.includes("• ") ||
    description.includes("* ") ||
    description.includes("- ");

  if (containsBulletPoints) {
    // Parse deskripsi yang berisi bullet points menjadi list yang terformat
    const items = description
      .split(/(?:^|\n)(?:• |\* |- )/) // Split on bullet points
      .filter((item) => item.trim().length > 0); // Remove empty items

    return (
      <div className="space-y-2">
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          {items.length > 0 && items[0].includes(":")
            ? items[0].split(":")[0] + ":"
            : null}
        </p>
        <ul className="list-disc pl-5 space-y-2.5 text-muted-foreground">
          {items.map((item, index) => (
            <li key={index}>{item.trim()}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Format paragraf standar
  return (
    <p className="text-base text-muted-foreground leading-relaxed">
      {description}
    </p>
  );
};
