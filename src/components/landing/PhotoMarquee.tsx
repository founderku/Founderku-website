const photos = [
  "p01", "p02", "p03", "p04", "p05", "p06", "p07", "p08",
  "p09", "p10", "p11", "p12", "p13", "p14", "p15", "p16",
];

function splitIntoColumns(list: string[], count: number): string[][] {
  const cols: string[][] = Array.from({ length: count }, () => []);
  list.forEach((item, i) => cols[i % count].push(item));
  return cols;
}

const columns = splitIntoColumns(photos, 4);

// Durasi & arah beda-beda tiap kolom biar keliatan alami, bukan
// serentak kayak 1 mesin - juga jadi efek parallax ringan.
const colConfig = [
  { duration: 46, reverse: false },
  { duration: 60, reverse: true },
  { duration: 52, reverse: false },
  { duration: 68, reverse: true },
];

export function PhotoMarquee() {
  return (
    <div
      className="absolute inset-0 overflow-hidden grid grid-cols-2 sm:grid-cols-4 gap-1.5"
      aria-hidden="true"
    >
      {columns.map((col, i) => {
        const doubled = [...col, ...col];
        const { duration, reverse } = colConfig[i];
        return (
          <div key={i} className="relative h-full overflow-hidden">
            <div
              className={`marquee-col${reverse ? " reverse" : ""} flex flex-col gap-1.5`}
              style={{ animationDuration: `${duration}s` }}
            >
              {doubled.map((p, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={j}
                  src={`/pajangin-assets/photos/${p}.jpg`}
                  alt=""
                  className="w-full aspect-square object-cover"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
