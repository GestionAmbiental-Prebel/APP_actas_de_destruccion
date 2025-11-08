type SectionTitleProps = {
  children: React.ReactNode;
};

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
      {children}
    </h3>
  );
}