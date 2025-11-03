import React from "react";
import Link from "next/link";
import { LucideIcon, Loader } from "lucide-react"; // Import Loader icon
import { Button } from "./button";

type ButtonProps = {
  label?: string;
  target?: "_blank";
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant: "primary" | "secondary" | "ghost" | "neutral" | "neutralOutline";
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  disabled?: boolean;
  icon?: LucideIcon;
  isSubmitting?: boolean; // Added isSubmitting prop
};

const CustomButton: React.FC<ButtonProps> = ({
  label,
  href,
  onClick,
  variant,
  type = "button",
  target,
  children,
  icon: Icon,
  disabled,
  isSubmitting,
}) => {
  // Define styles for each button variation
  const buttonStyles: Record<ButtonProps["variant"], string> = {
    primary: `
            'text-white'
        `,
    secondary: `
            ''
        `,
    ghost: "",
    neutral: "",
    neutralOutline: "",
  };

  // Apply styles based on the variant prop
  const styles = buttonStyles[variant];

  if (href) {
    return (
      <Button variant={variant} disabled={disabled}>
        <Link
          href={href}
          target={target}
          aria-disabled={disabled ? true : undefined}
          tabIndex={disabled ? -1 : undefined}
          className={`flex flex-row items-center gap-2 ${styles} ${
            disabled ? "pointer-events-none" : ""
          }`}
          passHref
        >
          {children}
          {Icon && <Icon className="h-4 w-4" />}
          <p className="text-sm ">{label}</p>
        </Link>
      </Button>
    );
  } else if (type) {
    return (
      <Button
        variant={variant}
        type={type}
        className={`flex flex-row items-center gap-2 ${styles}`}
        onClick={onClick}
        disabled={disabled}
      >
        {isSubmitting && <Loader className="animate-spin h-5 w-5 mr-3" />}
        {children}
        {Icon && <Icon className="h-4 w-4" />}
        {label && <p className="text-sm ">{label}</p>}
      </Button>
    );
  }
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={`flex flex-row items-center gap-2 ${styles}`}
      disabled={disabled}
    >
      {isSubmitting && <Loader className="animate-spin h-5 w-5 mr-3 " />}
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {label && <p className="text-sm ">{label}</p>}
    </Button>
  );
};

export default CustomButton;
