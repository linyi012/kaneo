import { Link } from "@tanstack/react-router";
import { getAppName } from "@/lib/app-branding";
import useProjectStore from "@/store/project";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  const { setProject } = useProjectStore();

  return (
    <Link
      onClick={() => {
        setProject(undefined);
      }}
      to="/dashboard"
      className={`w-auto ${className}`}
    >
      <img
        src="/logo-dark.svg"
        alt={getAppName()}
        className="h-6 w-auto dark:hidden"
      />
      <img
        src="/logo-light.svg"
        alt={getAppName()}
        className="hidden h-6 w-auto dark:block"
      />
    </Link>
  );
}
