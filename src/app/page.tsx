import HorizontalScroll from "./components/HorizontalScroll";
import BlobNav from "./components/BlobNav";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <BlobNav />
      <HorizontalScroll />
    </div>
  );
}
