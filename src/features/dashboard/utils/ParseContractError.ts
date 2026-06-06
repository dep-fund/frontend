import { ethers } from "ethers";

const OFFERING_ERRORS = [
  "error Offering__Closed()",
  "error Offering__HardCapReached()",
  "error Offering__SoftCapReached()",
  "error Offering__NothingToRefund()",
  "error Offering__SoftCapNotReached()",
  "error Offering__AlreadyWithdrawn()",
  "error Offering__NotClosed()",
  "error Offering__NotIssuer()",
];

const MARKETPLACE_ERRORS = [
  "error Marketplace__AmountIsZero()",
  "error Marketplace__PriceIsZero()",
  "error Marketplace__ListingNotActive()",
  "error Marketplace__SellerCannotBuyOwnListing()",
  "error Marketplace__NotTheSeller()",
  "error Marketplace__InsufficientTokensAvailable(uint256,uint256)",
];

const ERROR_MESSAGES: Record<string, string> = {
  Offering__Closed: "La oferta está cerrada.",
  Offering__HardCapReached: "Se alcanzó el Hard Cap.",
  Offering__SoftCapReached: "El Soft Cap ya fue alcanzado.",
  Offering__NothingToRefund: "No tenés nada para reembolsar.",
  Offering__SoftCapNotReached: "El Soft Cap no fue alcanzado todavía.",
  Offering__AlreadyWithdrawn: "Los fondos ya fueron retirados.",
  Offering__NotClosed: "La oferta todavía no cerró.",
  Offering__NotIssuer: "No sos el emisor.",
  Marketplace__AmountIsZero: "La cantidad no puede ser cero.",
  Marketplace__PriceIsZero: "El precio no puede ser cero.",
  Marketplace__ListingNotActive: "Este listing ya no está activo.",
  Marketplace__SellerCannotBuyOwnListing: "No podés comprar tu propio listing.",
  Marketplace__NotTheSeller: "No sos el vendedor de este listing.",
  Marketplace__InsufficientTokensAvailable: "No hay suficientes tokens disponibles.",
};

export function parseContractError(err: any): string {
    const data =
      err?.data ||
      err?.error?.data ||
      err?.info?.error?.data ||
      err?.cause?.data ||
      err?.error?.error?.data ||
      err?.revert?.data;
  
    if (data) {
      const iface = new ethers.Interface([...OFFERING_ERRORS, ...MARKETPLACE_ERRORS]);
      try {
        const decoded = iface.parseError(data);
        if (decoded) {
          return ERROR_MESSAGES[decoded.name] ?? decoded.name;
        }
      } catch {}
    }
  
    const msg =
      err?.info?.error?.message ||
      err?.shortMessage ||
      err?.reason ||
      err?.message ||
      "Error desconocido.";
  
    for (const key of Object.keys(ERROR_MESSAGES)) {
      if (msg.includes(key)) return ERROR_MESSAGES[key];
    }
  
    return msg;
  }