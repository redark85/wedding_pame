// =========================================================
// Cliente de Supabase para el frontend
// Requiere que exista supabase-config.js con la URL y la anon key.
// =========================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
