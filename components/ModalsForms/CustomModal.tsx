"use client";

import React, { useState } from "react"; // Import React
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
}: {
  heading: string;
  description: string;
  children: React.ReactNode;
  openBtnLabel?: string;
  btnVariant?: "primary" | "secondary" | "ghost"; // Made optional if customTrigger is used
  btnIcon?: LucideIcon; // Made optional
  className?: string;
  disabled?: boolean;
  customTrigger?: React.ReactNode; // For cases where an external element opens the modal
}) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Renamed for clarity

  const openModal = (): void => {
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  // Clone children and pass closeModal prop only to React components, not DOM elements
  const childrenWithProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    const childType: any = child.type as any;
    const isDOMElement = typeof childType === "string"; // e.g. 'div', 'section'
    if (isDOMElement) return child; // don't inject unknown props into DOM
    // @ts-ignore allow passing closeModal to custom components
    return React.cloneElement(child, { closeModal });
  });

  return (
    <div className={className}>
      {customTrigger ? (
        React.cloneElement(customTrigger as React.ReactElement<any>, {
          onClick: openModal,
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
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-header-text">
                    {heading}
                  </h2>
                  <p className="text-secondary-text mt-1">{description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  className="hover:bg-gray-100 rounded-full"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto">{childrenWithProps}</div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
