import React, { useState } from "react";
import {
  AppWindow,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileClock,
  Hammer,
  Laptop,
  PhoneCall,
  Search,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface ServicesViewProps {
  setActiveTab: (tab: string) => void;
}

type ActiveDept = "development" | "recruitment" | "tele-services";

export default function ServicesView({ setActiveTab }: ServicesViewProps) {
  const { t } = useLanguage();
  const [activeDept, setActiveDept] = useState<ActiveDept>("tele-services");
  const departments = [
  {
    id: "tele-services",
    label: t("Call center", "Call center"),
    title: t("Call center & tele-services", "Call center & téléservices"),
    description: t(
      "Our core expertise: customer relations, call handling, support, administrative assistance and request processing tailored to your needs.",
      "Notre expertise principale : relation client, gestion des appels, support, assistance administrative et traitement des demandes selon le périmètre convenu.",
    ),
    icon: <PhoneCall className="h-4 w-4" />,
    services: [
      {
        icon: <PhoneCall className="h-6 w-6 text-blue-900" />,
        title: t("Customer relations", "Centre de relation client"),
        description: t(
          "Managing customer interactions and supporting them throughout their journey.",
          "Gestion des échanges avec vos clients et accompagnement de leur parcours.",
        ),
      },
      {
        icon: <ShieldCheck className="h-6 w-6 text-blue-900" />,
        title: t("Customer support", "Support client"),
        description: t(
          "Answering questions and assisting your customers according to the guidelines we define together.",
          "Réponse aux questions et assistance de vos clients selon les consignes définies ensemble.",
        ),
      },
      {
        icon: <ClipboardList className="h-6 w-6 text-blue-900" />,
        title: t("Administrative assistance", "Assistance administrative"),
        description: t(
          "Handling administrative tasks to support your teams.",
          "Prise en charge de tâches administratives pour accompagner vos équipes.",
        ),
      },
      {
        icon: <PhoneCall className="h-6 w-6 text-blue-900" />,
        title: t("Call handling", "Gestion des appels"),
        description: t(
          "Answering, routing and tracking calls according to your organization.",
          "Réception, orientation et suivi des appels selon votre organisation.",
        ),
      },
      {
        icon: <FileClock className="h-6 w-6 text-blue-900" />,
        title: t("Request processing", "Traitement des demandes"),
        description: t(
          "Qualifying and handling requests received through your contact channels.",
          "Qualification et traitement des demandes reçues par vos canaux de contact.",
        ),
      },
      {
        icon: <BriefcaseBusiness className="h-6 w-6 text-blue-900" />,
        title: t("Back-office", "Back-office"),
        description: t(
          "Handling operational and administrative tasks to support your business.",
          "Réalisation de tâches opérationnelles et de traitement administratif en soutien à votre activité.",
        ),
      },
    ],
  },
  {
    id: "development",
    label: t("Development", "Développement"),
    title: t("Digital development", "Développement numérique"),
    description: t(
      "We design, integrate and enhance digital solutions to meet your needs and business processes.",
      "Nous concevons, intégrons et faisons évoluer des solutions numériques en fonction de vos besoins et de vos processus métier.",
    ),
    icon: <Laptop className="h-4 w-4" />,
    services: [
      {
        icon: <AppWindow className="h-6 w-6 text-blue-900" />,
        title: t("Web applications", "Applications web"),
        description: t(
          "Design and development of web applications tailored to your users and organizational goals.",
          "Conception et développement d’applications web adaptées aux utilisateurs et aux objectifs de votre organisation.",
        ),
      },
      {
        icon: <BriefcaseBusiness className="h-6 w-6 text-blue-900" />,
        title: t("Business applications", "Applications métier"),
        description: t(
          "Digital tools designed to support your activities and business processes.",
          "Outils numériques conçus pour accompagner vos activités et vos processus métier.",
        ),
      },
      {
        icon: <Hammer className="h-6 w-6 text-blue-900" />,
        title: t("Custom solutions", "Solutions sur mesure"),
        description: t(
          "Solutions developed to match your context, needs and priorities.",
          "Développement de solutions adaptées à votre contexte, à vos besoins et à vos priorités.",
        ),
      },
      {
        icon: <ClipboardList className="h-6 w-6 text-blue-900" />,
        title: t("Integration", "Intégration"),
        description: t(
          "Integrating solutions and systems into your existing environment.",
          "Intégration de solutions et de systèmes à votre environnement existant.",
        ),
      },
      {
        icon: <ShieldCheck className="h-6 w-6 text-blue-900" />,
        title: t("Enhancement and corrective maintenance", "Maintenance évolutive et corrective"),
        description: t(
          "Fixing issues and updating your applications as your business needs evolve.",
          "Correction des anomalies et évolution de vos applications selon les besoins de votre activité.",
        ),
      },
    ],
  },
  {
    id: "recruitment",
    label: t("Recruitment", "Recrutement"),
    title: t("Recruitment and HR support", "Recrutement et accompagnement RH"),
    description: t(
      "We help you source, assess and select candidates based on the profiles you are looking for.",
      "Nous vous accompagnons dans la recherche, l’évaluation et la sélection de candidats en fonction des profils recherchés.",
    ),
    icon: <Users2 className="h-4 w-4" />,
    services: [
      {
        icon: <Search className="h-6 w-6 text-blue-900" />,
        title: t("Candidate sourcing and selection", "Recherche et sélection de profils"),
        description: t(
          "Identifying and selecting candidates according to the skills and criteria we define with you.",
          "Identification de candidats et sélection selon les compétences et critères définis avec vous.",
        ),
      },
      {
        icon: <Laptop className="h-6 w-6 text-blue-900" />,
        title: t("IT recruitment", "Recrutement IT"),
        description: t(
          "Finding IT and technical profiles that match your needs.",
          "Recherche de profils informatiques et techniques correspondant à vos besoins.",
        ),
      },
      {
        icon: <Users2 className="h-6 w-6 text-blue-900" />,
        title: t("Recruitment outsourcing", "Externalisation du recrutement"),
        description: t(
          "Outsourcing selected stages or your entire recruitment process.",
          "Prise en charge externalisée de certaines étapes ou de l’ensemble de votre processus de recrutement.",
        ),
      },
      {
        icon: <CheckCircle2 className="h-6 w-6 text-blue-900" />,
        title: t("Candidate pre-screening", "Préqualification des candidats"),
        description: t(
          "Initial candidate assessments based on the role requirements and your criteria.",
          "Évaluation initiale des candidatures à partir des exigences du poste et de vos critères.",
        ),
      },
      {
        icon: <ClipboardList className="h-6 w-6 text-blue-900" />,
        title: t("HR support", "Accompagnement RH"),
        description: t(
          "Supporting HR teams in organizing and tracking their recruitment needs.",
          "Appui aux équipes RH pour organiser et suivre leurs besoins de recrutement.",
        ),
      },
    ],
  },
] satisfies {
  id: ActiveDept;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  services: { icon: React.ReactNode; title: string; description: string }[];
}[];
  const department = departments.find((item) => item.id === activeDept)!;

  return (
    <div className="space-y-12 py-8">
      <section className="mx-auto max-w-7xl space-y-3 px-4 pt-8 text-center sm:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
          {t("Our services", "Nos services")}
        </span>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-5xl">
          {t("Expertise to meet your needs", "Des expertises au service de vos besoins")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600">
          {t(
            "Call center services are our primary focus, complemented by digital development and recruitment. Select an area to explore our services.",
            "EBI Services met le Call center en premier plan, puis complète son offre par le développement et le recrutement. Sélectionnez un domaine pour découvrir les services proposés.",
          )}
        </p>
      </section>

      <section
        aria-label={t("Service areas", "Domaines de services")}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex justify-center overflow-x-auto border-b border-gray-200">
          <div className="inline-flex min-w-max gap-2 rounded-xl border border-gray-200 bg-gray-100 p-1.5">
            {departments.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={activeDept === item.id}
                onClick={() => setActiveDept(item.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                  activeDept === item.id
                    ? "bg-blue-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-7 sm:p-9">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
            {department.label}
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-blue-950">
            {department.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            {department.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {department.services.map((service) => (
            <article
              key={service.title}
              className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                {service.icon}
              </div>
              <h3 className="font-display text-base font-bold text-slate-950">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-950">
            {t("Let's discuss your needs", "Parlons de votre besoin")}
          </h2>
          <p className="text-sm leading-relaxed text-gray-600">
            {t(
              "Tell our team about your project. We will connect you with the right person and define the next steps.",
              "Présentez votre projet à notre équipe pour être orienté vers le bon interlocuteur et définir les prochaines étapes.",
            )}
          </p>
          <button
            onClick={() => setActiveTab("contact")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-950"
          >
            {t("Contact our team", "Contacter notre équipe")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
