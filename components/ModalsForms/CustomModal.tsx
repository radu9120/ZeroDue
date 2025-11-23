"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type MouseEvent,
  type ReactNode,
  type ReactElement,
} from "react";
import { Button } from "../ui/button";
import { LucideIcon, X } from "lucide-react"; // Removed Plus as it's an icon prop
import ModalPortal from "../ui/ModalPortal";
import CustomButton from "../ui/CustomButton";

export default function CustomModal({
  heading,
  description,
  children,
  openBtnLabel,
  btnVariant,
  btnIcon: Icon, // Renamed for clarity if Icon is used directly
  className,
  disabled,
  customTrigger, // Added from previous context, assuming it might be needed
  maxWidth = "max-w-3xl",
}: {
  heading: string;
  description: string;
  children: ReactNode;
  openBtnLabel?: string;
  btnVariant?: "primary" | "secondary" | "ghost"; // Made optional if customTrigger is used
  btnIcon?: LucideIcon; // Made optional
  className?: string;
  disabled?: boolean;
  customTrigger?: ReactElement; // For cases where an external element opens the modal
  maxWidth?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Renamed for clarity

  const openModal = (): void => {
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  // Clone children and pass closeModal prop only to React components, not DOM elements
  const childrenWithProps = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const childType: any = child.type as any;
    const isDOMElement = typeof childType === "string"; // e.g. 'div', 'section'
    if (isDOMElement) return child; // don't inject unknown props into DOM
    // @ts-ignore allow passing closeModal to custom components
    return cloneElement(child as ReactElement, { closeModal });
  });

  const triggerElement =
    customTrigger && isValidElement(customTrigger)
      ? (customTrigger as ReactElement<{
          onClick?: (event: MouseEvent<Element>) => void;
        }>)
      : null;

  return (
    <div className={className}>
      {triggerElement ? (
        cloneElement(triggerElement, {
          onClick: (event: MouseEvent<Element>) => {
            if (typeof triggerElement.props.onClick === "function") {
              triggerElement.props.onClick(event);
            }
            if (!event.defaultPrevented) {
              openModal();
            }
          },
        })
      ) : (
        <CustomButton
          variant={btnVariant || "primary"}
          onClick={openModal}
          label={openBtnLabel}
          icon={Icon} // Icon prop for CustomButton
          disabled={disabled}
        />
      )}
      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col ${maxWidth}`}
            >
              <div className="flex items-start sm:items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex-1 min-w-0 pr-2">
                  <h2 className="text-xl md:text-2xl font-bold text-header-text dark:text-slate-100">
                    {heading}
                  </h2>
                  <p className="text-sm md:text-base text-secondary-text dark:text-slate-400 mt-1">
                    {description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  className="hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </Button>
              </div>
              <div className="p-4 md:p-6 overflow-y-auto">
                {childrenWithProps}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
