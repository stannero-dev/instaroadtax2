const getProductionBackendUrl = () => {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8001";
  }

  const { protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://127.0.0.1:8001";
  }

  const rootHostname = hostname.replace(/^www\./, "");
  return `${protocol}//api.${rootHostname}`;
};

export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || getProductionBackendUrl();

export const API = `${BACKEND_URL}/api`;
