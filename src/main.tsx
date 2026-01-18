import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {StarknetProvider} from "./provider/starknet-provider"

createRoot(document.getElementById("root")!).render(<StarknetProvider><App /></StarknetProvider>);
