import logoImg from "@/assets/logo-celeste.png";

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "h-8", md: "h-12", lg: "h-16" };
  return (
    <div className="flex items-center gap-2">
      <img src={logoImg} alt="Celeste Agrotec" className={sizes[size]} />
      <span className="font-heading font-bold text-primary text-lg">
        Celeste <span className="text-secondary">Agrotec</span>
      </span>
    </div>
  );
};

export default Logo;
