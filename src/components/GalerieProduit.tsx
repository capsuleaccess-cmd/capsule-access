"use client";

import { useState } from "react";
import ImageProduit from "./ImageProduit";

export default function GalerieProduit({
  photos,
  nom,
}: {
  photos: string[];
  nom: string;
}) {
  const [index, setIndex] = useState(0);

  return (
    <div>
      <ImageProduit
        src={photos[index]}
        alt={nom}
        className="aspect-square w-full rounded-xl"
      />
      {photos.length > 1 && (
        <div className="mt-2 flex gap-2">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                i === index ? "border-primary" : "border-transparent"
              }`}
            >
              <ImageProduit src={url} alt={`${nom} ${i + 1}`} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
