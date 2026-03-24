/**
 * Consistent max-width and horizontal padding for page content.
 * Use on public site and dashboard pages for alignment.
 */
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

export function PageContainer({
  children,
  className = "",
  as: Component = "div",
}: PageContainerProps) {
  return (
    <Component className={`max-w-content mx-auto px-4 md:px-6 ${className}`}>
      {children}
    </Component>
  );
}
