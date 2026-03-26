"use client";

import { use, useRef, useEffect, useState } from "react";
import Image from "next/image";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";
import StatCard from "@/app/components/StatCard";
import { comteColors } from "@/lib/comte-colors";
import router from "next/router";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function FittingHeadline({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(120);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      let size = 200;
      text.style.fontSize = `${size}px`;
      while (
        size > 12 &&
        (text.scrollWidth > container.clientWidth || text.scrollHeight > container.clientHeight)
      ) {
        size -= 4;
        text.style.fontSize = `${size}px`;
      }
      setFontSize(size);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 flex items-center justify-center overflow-hidden w-full px-4"
    >
      <h1
        ref={textRef}
        style={{ fontSize: `${fontSize}px` }}
        className="font-light text-foreground text-center leading-tight"
      >
        {children}
      </h1>
    </div>
  );
}

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
      <BlobNav />
      <div className="w-full h-[80vh] flex flex-col items-center justify-start pt-12 bg-background">
        <FittingHeadline>{"Transforming Meals in Kindergartens"}</FittingHeadline>
        <p className="italic text-xl text-gray-500">2025</p>
        <p className="text-xl text-gray-500">Hårstadmarka barnehager, Trondheim kommune</p>
      </div>
      <div className="w-full bg-background px-6 md:px-12 lg:px-24 py-8">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
            priority
          />
        </div>
      </div>
      <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
        <div className="text-foreground font-light space-y-6 text-lg leading-relaxed">
          <p className="text-2xl font-bold text-center">The sociteal issue</p>
          <p>
            Kindergartens face growing pressure from limited staffing and high sick leave. Staff are
            expected to manage everything from food purchasing and meal service to meeting
            pedagogical goals. In practice, this leaves less time and energy for being present with
            the children.
          </p>
          <p>
            This matters because, in Norway, 9 out of 10 children aged 1–5 attend kindergarten, and
            the meals served there make up an important part of their daily diet.
          </p>
          <p>
            At Hårstadmarka kindergartens, the COVID-19 pandemic led to a reduced meal offer. Staff
            found that this gave them more uninterrupted time with the children and allowed them to
            be more present. Based on these experiences, the project explored how kindergartens
            could improve nutrition, sustainability, pedagogy, and working conditions at the same
            time.
          </p>
        </div>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto gap-2 bg-background pt-2 pb-2 h-[50vh]">
        <StatCard
          value="50%"
          description="Reduced sick leave"
          backgroundColor={comteColors.coral}
          textColor={comteColors.cream}
        />
        <StatCard
          value="47"
          description="Menn inkludert i prøveordning"
          backgroundColor={comteColors.yellow}
          textColor={comteColors.darkGreen}
        />
        <StatCard
          value="25%"
          description="Voksenandel i styre"
          backgroundColor={comteColors.mutedGreen}
          textColor={comteColors.lightBase}
        />
      </div>

      <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
        <div className="text-foreground font-light space-y-6 text-lg leading-relaxed">
          <p className="text-2xl font-bold text-center">The solution</p>
          <p>
            Together with Trondheim Municipality, NAV Arbeidslivssenter, and Stimulab (DOGA and
            Digdir), we developed four solutions with Hårstadmarka kindergartens.
          </p>
          <p>
            First, we introduced meal assistants. In collaboration with Heltmed and NAV, meal
            assistants were recruited to take responsibility for practical meal-related tasks. This
            reduced pressure on staff and gave them more time for pedagogical work.
          </p>
          <p>
            Second, we designed and built the Pavilion, a dedicated outdoor meal space. It functions
            as a shared arena for cooking and healthy meals, while making it easier for children to
            take part in food preparation. Designed as a DIY solution with step-by-step
            documentation, it can be replicated in other kindergartens.
          </p>
          <p>
            Third, we developed a new meal planning system. The system supports better
            collaboration, increases meal variety, and makes it easier for staff to involve children
            in planning and preparing meals.
          </p>
          <p>
            Fourth, we improved food logistics. By coordinating deliveries of hot meals, dry goods,
            drinks, fruit, and vegetables, the kindergarten reduced deliveries from six truck trips
            to one. This saved time, reduced costs, and lowered emissions.
          </p>
        </div>
        <div className="space-y-7 mt-12">
          <p className="text-2xl font-bold text-center">Why this approach worked</p>
          <p>
            The project worked because it addressed several connected challenges at once. Instead of
            treating food, pedagogy, sustainability, and the working environment as separate issues,
            it brought them together in one practical model.
          </p>
          <p>
            We worked closely with staff and users throughout the process. Solutions were prototyped
            and tested in real life, adjusted based on feedback, and documented along the way. This
            made the changes practical, relevant, and easier to adopt in everyday kindergarten
            operations.
          </p>
          <p className="text-2xl font-bold text-center">Impact</p>
          <p>
            The project created a more sustainable and supportive meal system for kindergartens.
            Staff gained practical relief and more time to focus on children, while children
            benefited from healthier meals and greater involvement in food preparation. The new
            planning system made routines easier, and the new collaboration with the municipal
            production kitchen reduced transport needs, logistics, and climate impact.
          </p>
          <p>
            The impact was measurable. At Hårstadmarka kindergartens, the project helped reduce sick
            leave from 20% to 10%. It also contributed to less stress, healthier food, greater
            stability for staff, and a more predictable everyday experience for both employees and
            children.
          </p>
          <p>
            The project also received national recognition through the DOGA Award for Design and
            Architecture. The jury highlighted its strong transfer value and systemic approach to
            solving a complex public-sector challenge through co-creation and experimentation.
          </p>
          <p className="text-2xl font-bold text-center">Scalability</p>
          <p>
            The project was designed to scale from the start. Its solutions were developed as
            practical models that other kindergartens can adopt and adapt. With DIY documentation
            for the Pavilion, structured routines for meal planning, and a transferable meal
            assistant role, the project offers a scalable framework for improving nutrition,
            pedagogy, and working conditions across municipalities. The solutions are already
            beginning to spread to other kindergartens in Trondheim.
          </p>
          <p>This project was carried out in collaboration with Ramboll Management Consulting.</p>

          <p className="text-2xl font-bold text-center">Value creation</p>
          <p>
            The project created value beyond healthier meals and better routines. By involving
            children more actively in food preparation and meal experiences, it helped shape healthy
            eating habits early in life. This is important, as the way children learn to eat in
            kindergarten can influence how they relate to food in the future.
          </p>
          <p>
            The project also increased parents’ awareness of the quality of food children encounter
            from an early age and created stronger engagement around food, health, and learning. It
            showed that meals can be a source of wellbeing, participation, and joy for both children
            and adults.
          </p>
          <p>
            In addition, the project generated lasting value through the tools and systems it
            developed, including a food-learning game, a booking system, clearer routines, a
            scalable Pavilion, and new ways of organising meal work. Together, these solutions
            created strong local ownership and made the project easier to replicate and build on.
          </p>
        </div>
      </div>
      <div className="w-full px-2 h-[50vh] flex flex-col items-start justify-end pt-12 bg-background">
        <h1 className="text-5xl py-12 font-light text-foreground">
          Do you have any questions regarding this project?
        </h1>
      </div>

      <div className="w-full flex flex-col md:flex-row md:items-stretch gap-2 py-2 p-0">
        <button
          onClick={() => {
            router.push("/about#aboutContact");
          }}
          type="button"
          className="w-full rounded-full md:w-1/2 h-[30vh] md:h-[50vh] flex items-center justify-center bg-foreground text-background font-light hover:cursor-pointer text-2xl md:text-3xl tracking-wide hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30 shrink-0"
          aria-label="Send message"
        >
          Contect us
        </button>
        <div className="flex flex-col gap-1 justify-center text-foreground/70 font-light text-lg px-6 py-8 md:px-0 md:py-0 md:w-1/2">
          <div className="relative overflow-hidden rounded-lg h-full w-full">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
