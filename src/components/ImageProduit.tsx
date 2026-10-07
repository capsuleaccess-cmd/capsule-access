export default function ImageProduit({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return <div className={`bg-gray-100 ${className || ""}`} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className || ""}`} />;
}
