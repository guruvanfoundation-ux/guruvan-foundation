import { Link } from "react-router-dom";

/** Dark-green page banner with breadcrumb and right-side photo, as in the mockups. */
export default function PageHero({ title, image, clear = false }) {
  return (
    <section className="relative overflow-hidden bg-forest-deep">
      <img
        src={image}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover object-center ${clear ? "opacity-90" : "opacity-45"}`}
        loading="eager"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-r ${
          clear
            ? "from-forest-deep/85 via-forest-deep/45 to-transparent"
            : "from-forest-deep via-forest-deep/70 to-transparent"
        }`}
      />
      <div className="container-g relative flex min-h-[210px] flex-col justify-center py-10 sm:min-h-[260px]">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm font-medium text-white/85">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span>{title}</span>
        </p>
      </div>
    </section>
  );
}
