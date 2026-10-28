import type { VaultEntry, VaultEntryDraft } from "@/lib/vault";

export type AiProvider = {
  id: string;
  name: string;
  keyName: string;
  keyUrl: string;
  sourceUrl: string;
  access: "Cota gratuita" | "Avaliação gratuita" | "Conferir condições";
  description: string;
  domains: string[];
};

export const PROVIDERS_CHECKED_AT = "28/10/2026";

// Commercial conditions are reviewed manually; sources are available in each card.
export const aiProviders: AiProvider[] = [
  {
    id: "openrouter", name: "OpenRouter", keyName: "OPENROUTER_API_KEY",
    keyUrl: "https://openrouter.ai/settings/keys", sourceUrl: "https://openrouter.ai/collections/free-models",
    access: "Cota gratuita", description: "Modelos marcados como gratuitos; limites de uso e disponibilidade por modelo.", domains: ["openrouter.ai"],
  },
  {
    id: "cohere", name: "Cohere", keyName: "COHERE_API_KEY",
    keyUrl: "https://dashboard.cohere.com/api-keys", sourceUrl: "https://docs.cohere.com/docs/rate-limits",
    access: "Avaliação gratuita", description: "Chave de avaliação com uso limitado. Produção tem condições e cobrança próprias.", domains: ["cohere.com", "cohere.ai"],
  },
  {
    id: "gemini", name: "Google Gemini", keyName: "GEMINI_API_KEY",
    keyUrl: "https://aistudio.google.com/apikey", sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    access: "Cota gratuita", description: "Camada gratuita em modelos elegíveis; cotas variam por modelo, conta e região.", domains: ["ai.google.dev", "aistudio.google.com", "generativelanguage.googleapis.com"],
  },
  {
    id: "groq", name: "Groq", keyName: "GROQ_API_KEY",
    keyUrl: "https://console.groq.com/keys", sourceUrl: "https://console.groq.com/docs/rate-limits",
    access: "Cota gratuita", description: "Plano gratuito com limites de requisições e tokens definidos por modelo.", domains: ["groq.com"],
  },
  {
    id: "mistral", name: "Mistral AI", keyName: "MISTRAL_API_KEY",
    keyUrl: "https://console.mistral.ai/", sourceUrl: "https://help.mistral.ai/en/articles/698531-why-am-i-hitting-api-rate-limits-and-how-do-i-increase-them",
    access: "Avaliação gratuita", description: "Free mode para avaliação e protótipos. Confira modelos disponíveis e limites no painel.", domains: ["mistral.ai"],
  },
  {
    id: "cerebras", name: "Cerebras", keyName: "CEREBRAS_API_KEY",
    keyUrl: "https://cloud.cerebras.ai/", sourceUrl: "https://www.cerebras.ai/pricing",
    access: "Avaliação gratuita", description: "Créditos iniciais de teste com prazo e condições próprios. Não é uma cota gratuita renovável.", domains: ["cerebras.ai"],
  },
  {
    id: "cloudflare", name: "Cloudflare Workers AI", keyName: "CLOUDFLARE_API_TOKEN",
    keyUrl: "https://dash.cloudflare.com/", sourceUrl: "https://developers.cloudflare.com/workers-ai/platform/pricing/",
    access: "Cota gratuita", description: "Franquia diária de inferência. Também requer o Account ID para usar a API.", domains: ["cloudflare.com"],
  },
  {
    id: "nvidia", name: "NVIDIA NIM", keyName: "NVIDIA_API_KEY",
    keyUrl: "https://build.nvidia.com/", sourceUrl: "https://docs.api.nvidia.com/nim/docs/product",
    access: "Avaliação gratuita", description: "Acesso de avaliação para desenvolvedores. Confira os modelos, créditos e limites da sua conta.", domains: ["nvidia.com"],
  },
  {
    id: "nous", name: "Nous Portal", keyName: "NOUS_API_KEY",
    keyUrl: "https://portal.nousresearch.com/", sourceUrl: "https://portal.nousresearch.com/",
    access: "Conferir condições", description: "Há modelos gratuitos no portal, mas chaves de API usam créditos. Não confundir com o plano do Hermes.", domains: ["nousresearch.com"],
  },
  {
    id: "orcarouter", name: "OrcaRouter", keyName: "ORCAROUTER_API_KEY",
    keyUrl: "https://www.orcarouter.ai/", sourceUrl: "https://www.orcarouter.ai/",
    access: "Conferir condições", description: "Gateway com plano gratuito e sem margem sobre tokens. O consumo dos modelos pode ser cobrado.", domains: ["orcarouter.ai"],
  },
];

export function providerEntries(provider: AiProvider, entries: VaultEntry[]) {
  return entries.filter((entry) => {
    if (entry.category !== "api" || !entry.secret.trim()) return false;
    if (entry.providerId) return entry.providerId === provider.id;
    if (entry.title.trim().toLocaleLowerCase("pt-BR") === provider.name.toLocaleLowerCase("pt-BR")) return true;
    try {
      const hostname = new URL(entry.url).hostname.toLowerCase();
      return provider.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  });
}

export function providerDraft(provider: AiProvider): VaultEntryDraft {
  return {
    providerId: provider.id, title: provider.name, category: "api", username: provider.keyName,
    secret: "", url: provider.keyUrl, notes: "", favorite: false,
  };
}
