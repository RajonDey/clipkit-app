/**
 * Design tokens and centralized styles for the application
 */

export const colors = {
  primary: {
    light: "bg-orange-50 text-orange-700",
    medium: "bg-orange-500 text-white",
    hover: "hover:bg-orange-600",
    border: "border-orange-200",
    borderActive: "border-orange-500",
    borderHover: "hover:border-orange-200",
  },
  secondary: {
    light: "bg-neutral-100 text-neutral-700",
    medium: "bg-neutral-200 text-neutral-700",
    hover: "hover:bg-neutral-300",
  },
  success: {
    light: "bg-green-50 text-green-700",
    medium: "bg-green-500 text-white",
    hover: "hover:bg-green-600",
  },
  danger: {
    light: "bg-red-50 text-red-600",
    medium: "bg-red-500 text-white",
    hover: "hover:bg-red-600",
  },
  info: {
    light: "bg-blue-50 text-blue-700",
    medium: "bg-blue-500 text-white",
    hover: "hover:bg-blue-600",
  },
};

export const clipTypeStyles = {
  text: {
    color: "border-orange-400 bg-orange-50",
    icon: "text",
    label: "Text",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-400",
    textColor: "text-orange-700",
  },
  image: {
    color: "border-blue-400 bg-blue-50",
    icon: "image",
    label: "Images",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
    textColor: "text-blue-700",
  },
  code: {
    color: "border-neutral-500 bg-neutral-100",
    icon: "code",
    label: "Code",
    bgColor: "bg-neutral-100",
    borderColor: "border-neutral-500",
    textColor: "text-neutral-700",
  },
  link: {
    color: "border-yellow-400 bg-yellow-50",
    icon: "link",
    label: "Links",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-700",
  },
  video: {
    color: "border-purple-400 bg-purple-50",
    icon: "video",
    label: "Videos",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-400",
    textColor: "text-purple-700",
  },
};

export const buttonStyles = {
  primary: `px-4 py-2 rounded ${colors.primary.medium} font-medium ${colors.primary.hover} transition-all`,
  secondary: `px-4 py-2 rounded ${colors.secondary.light} ${colors.secondary.hover} transition-all`,
  danger: `px-4 py-2 rounded ${colors.danger.medium} ${colors.danger.hover} transition-all`,
  outline: `px-4 py-2 rounded bg-white border border-neutral-200 hover:bg-orange-50 text-neutral-700 font-medium transition-all`,
  icon: `p-1.5 rounded hover:bg-orange-100 text-orange-600 transition-colors`,
  iconDanger: `p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors`,
  iconNeutral: `p-1.5 rounded hover:bg-neutral-100 text-neutral-500 transition-colors`,
  iconBlue: `p-1.5 rounded hover:bg-blue-100 text-blue-500 transition-colors`,
};

export const inputStyles = {
  default:
    "px-3 py-2 border border-neutral-200 rounded text-neutral-900 bg-white",
  focus: "focus:border-orange-400 focus:outline-none",
  textArea: "resize-vertical min-h-[80px]",
};
