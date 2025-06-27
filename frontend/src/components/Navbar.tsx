import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-white">
      <div className="text-2xl font-bold text-blue-900">
        deepware<sup>®</sup>
      </div>
      <div className="space-x-6 text-gray-700 font-medium">
        <Link href="#">PAGI GEN</Link>
        <Link href="#">DEEPWARE SCANNER</Link>
        <Link href="#">ABOUT US</Link>
        <Link href="#">CONTACT US</Link>
      </div>
    </nav>
  );
};

export default Navbar;
