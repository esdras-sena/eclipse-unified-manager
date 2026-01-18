import { ReactNode, CSSProperties } from "react";

type GenericModalProps = {
  popoverId: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
};

const GenericModal = ({
  popoverId,
  className,
  children,
  style,
}: GenericModalProps) => {
  return (
    <div
      id={popoverId}
      className={className}
      style={style}
      {...({ popover: "auto" } as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  );
};

export default GenericModal;
