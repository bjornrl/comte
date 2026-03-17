import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/all";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, Flip);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const initNavbarAnimations = () => {
  const navbarBg = document.querySelector(".navbar-background");
  const navbarItems = document.querySelector(".navbar-items");
  const navbarLinks = document.querySelectorAll(".navbar-links");
  const navbarLogo = document.querySelector(".navbar-logo");

  const isDesktop = window.innerWidth >= 720;
  if (!isDesktop) {
    navbarLogo.classList.add("navbar-logo-pinned");
    gsap.set(navbarLogo, { width: 250 });
    gsap.set([navbarBg, navbarItems], { width: "100%", height: "100vh" });
    return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const initialWidth = navbarBg.offsetWidth;
  const initialHeight = navbarBg.offsetHeight;
  const initialLinksWidths = Array.from(navbarLinks).map(
    (link) => link.offsetWidth,
  );

  const state = Flip.getState(navbarLogo);
  navbarLogo.classList.add("navbar-logo-pinned");
  gsap.set(navbarLogo, { width: 250 });
  const flip = Flip.from(state, { duration: 1, ease: "none", paused: true });

  ScrollTrigger.create({
    trigger: ".navbar-backdrop",
    start: "top top",
    end: `+=${viewportHeight}px`,
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;

      gsap.set([navbarBg, navbarItems], {
        width: gsap.utils.interpolate(initialWidth, viewportWidth, p),
        height: gsap.utils.interpolate(initialHeight, viewportHeight, p),
      });

      navbarLinks.forEach((link, i) => {
        gsap.set(link, {
          width: gsap.utils.interpolate(
            link.offsetWidth,
            initialLinksWidths[i],
            p,
          ),
        });
      });

      flip.progress(p);
    },
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initNavbarAnimations();

  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      ScrollTrigger.getAll().forEach((t) => t.kill());

      const navbarBg = document.querySelector(".navbar-background");
      const navbarItems = document.querySelector(".navbar-items");
      const navbarLinks = document.querySelectorAll(".navbar-links");
      const navbarLogo = document.querySelector(".navbar-logo");

      gsap.set([navbarBg, navbarItems, navbarLogo, ...navbarLinks], {
        clearProps: "all",
      });
      navbarLogo.classList.remove("navbar-logo-pinned");

      initNavbarAnimations();
    }, 250);
  });
});
