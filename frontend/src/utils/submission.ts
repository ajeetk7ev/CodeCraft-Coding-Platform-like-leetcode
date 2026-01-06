export const verdictColor = (verdict: string) => {
  switch (verdict) {
    case "ACCEPTED":
      return "text-green-400 bg-green-400/10 border-green-400/20";
    case "WRONG_ANSWER":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    case "COMPILE_ERROR":
    case "INTERNAL_ERROR":
      return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    case "PARTIAL":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    default:
      return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
};

export const formatDate = (date: string) =>
  new Date(date).toLocaleString();
