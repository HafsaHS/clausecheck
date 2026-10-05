export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: number
          meta: Json
          org_id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: never
          meta?: Json
          org_id: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: never
          meta?: Json
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chunks: {
        Row: {
          clause_id: string | null
          contract_id: string
          embedding: string
          fts: unknown
          id: string
          org_id: string
          page_end: number
          page_start: number
          section_ref: string | null
          text: string
          token_count: number
        }
        Insert: {
          clause_id?: string | null
          contract_id: string
          embedding: string
          fts?: unknown
          id?: string
          org_id: string
          page_end: number
          page_start: number
          section_ref?: string | null
          text: string
          token_count: number
        }
        Update: {
          clause_id?: string | null
          contract_id?: string
          embedding?: string
          fts?: unknown
          id?: string
          org_id?: string
          page_end?: number
          page_start?: number
          section_ref?: string | null
          text?: string
          token_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "chunks_clause_id_fkey"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "clauses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clause_assessments: {
        Row: {
          clause_id: string
          contract_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          edited_redline: string | null
          id: string
          org_id: string
          playbook_version: number
          position: Database["public"]["Enums"]["position"]
          quoted_text: string
          rationale: string
          redline_status: Database["public"]["Enums"]["redline_status"]
          risk: Database["public"]["Enums"]["risk"]
          rule_id: string | null
          suggested_redline: string | null
        }
        Insert: {
          clause_id: string
          contract_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          edited_redline?: string | null
          id?: string
          org_id: string
          playbook_version: number
          position: Database["public"]["Enums"]["position"]
          quoted_text: string
          rationale: string
          redline_status?: Database["public"]["Enums"]["redline_status"]
          risk: Database["public"]["Enums"]["risk"]
          rule_id?: string | null
          suggested_redline?: string | null
        }
        Update: {
          clause_id?: string
          contract_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          edited_redline?: string | null
          id?: string
          org_id?: string
          playbook_version?: number
          position?: Database["public"]["Enums"]["position"]
          quoted_text?: string
          rationale?: string
          redline_status?: Database["public"]["Enums"]["redline_status"]
          risk?: Database["public"]["Enums"]["risk"]
          rule_id?: string | null
          suggested_redline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clause_assessments_clause_id_fkey"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "clauses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clause_assessments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clause_assessments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clause_assessments_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "playbook_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      clauses: {
        Row: {
          char_end: number
          char_start: number
          clause_type: string
          confidence: number
          contract_id: string
          created_at: string
          heading: string | null
          id: string
          key_terms: Json
          org_id: string
          page_end: number
          page_start: number
          section_ref: string | null
          text: string
        }
        Insert: {
          char_end: number
          char_start: number
          clause_type: string
          confidence: number
          contract_id: string
          created_at?: string
          heading?: string | null
          id?: string
          key_terms?: Json
          org_id: string
          page_end: number
          page_start: number
          section_ref?: string | null
          text: string
        }
        Update: {
          char_end?: number
          char_start?: number
          clause_type?: string
          confidence?: number
          contract_id?: string
          created_at?: string
          heading?: string | null
          id?: string
          key_terms?: Json
          org_id?: string
          page_end?: number
          page_start?: number
          section_ref?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "clauses_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clauses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_pages: {
        Row: {
          char_end: number
          char_start: number
          contract_id: string
          org_id: string
          page_number: number
          text: string
        }
        Insert: {
          char_end: number
          char_start: number
          contract_id: string
          org_id: string
          page_number: number
          text: string
        }
        Update: {
          char_end?: number
          char_start?: number
          contract_id?: string
          org_id?: string
          page_number?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_pages_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          counterparty: string | null
          created_at: string
          error: string | null
          id: string
          mime_type: string
          org_id: string
          our_side: Database["public"]["Enums"]["our_side"] | null
          page_count: number | null
          pages_are_estimated: boolean
          playbook_id: string | null
          signed_off_at: string | null
          signed_off_by: string | null
          status: Database["public"]["Enums"]["contract_status"]
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          counterparty?: string | null
          created_at?: string
          error?: string | null
          id?: string
          mime_type: string
          org_id: string
          our_side?: Database["public"]["Enums"]["our_side"] | null
          page_count?: number | null
          pages_are_estimated?: boolean
          playbook_id?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          counterparty?: string | null
          created_at?: string
          error?: string | null
          id?: string
          mime_type?: string
          org_id?: string
          our_side?: Database["public"]["Enums"]["our_side"] | null
          page_count?: number | null
          pages_are_estimated?: boolean
          playbook_id?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      eval_runs: {
        Row: {
          cost_usd: number | null
          created_at: string
          dataset_version: string
          duration_s: number | null
          embedding_model: string
          git_sha: string | null
          id: string
          metrics: Json
          model: string
          per_item: Json
          split: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          dataset_version: string
          duration_s?: number | null
          embedding_model: string
          git_sha?: string | null
          id?: string
          metrics: Json
          model: string
          per_item: Json
          split: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          dataset_version?: string
          duration_s?: number | null
          embedding_model?: string
          git_sha?: string | null
          id?: string
          metrics?: Json
          model?: string
          per_item?: Json
          split?: string
        }
        Relationships: []
      }
      exports: {
        Row: {
          contract_id: string
          created_at: string
          created_by: string | null
          format: string
          id: string
          is_draft: boolean
          org_id: string
          storage_path: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          created_by?: string | null
          format: string
          id?: string
          is_draft: boolean
          org_id: string
          storage_path: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          created_by?: string | null
          format?: string
          id?: string
          is_draft?: boolean
          org_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_calls: {
        Row: {
          cache_read_tokens: number | null
          cache_write_tokens: number | null
          contract_id: string | null
          cost_usd: number | null
          created_at: string
          error: string | null
          id: number
          input_tokens: number | null
          latency_ms: number | null
          model: string
          org_id: string | null
          output_tokens: number | null
          purpose: string
          stop_reason: string | null
        }
        Insert: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          contract_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          id?: never
          input_tokens?: number | null
          latency_ms?: number | null
          model: string
          org_id?: string | null
          output_tokens?: number | null
          purpose: string
          stop_reason?: string | null
        }
        Update: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          contract_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          id?: never
          input_tokens?: number | null
          latency_ms?: number | null
          model?: string
          org_id?: string | null
          output_tokens?: number | null
          purpose?: string
          stop_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_calls_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "llm_calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_clauses: {
        Row: {
          clause_type: string
          contract_id: string
          id: string
          org_id: string
          recommendation: string
          rule_id: string | null
          severity: Database["public"]["Enums"]["risk"]
          suggested_language: string | null
        }
        Insert: {
          clause_type: string
          contract_id: string
          id?: string
          org_id: string
          recommendation: string
          rule_id?: string | null
          severity: Database["public"]["Enums"]["risk"]
          suggested_language?: string | null
        }
        Update: {
          clause_type?: string
          contract_id?: string
          id?: string
          org_id?: string
          recommendation?: string
          rule_id?: string | null
          severity?: Database["public"]["Enums"]["risk"]
          suggested_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missing_clauses_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missing_clauses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missing_clauses_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "playbook_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          is_demo_sandbox: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo_sandbox?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo_sandbox?: boolean
          name?: string
        }
        Relationships: []
      }
      playbook_rules: {
        Row: {
          clause_type: string
          fallback: string | null
          guidance: string | null
          id: string
          org_id: string
          playbook_id: string
          preferred: string
          required: boolean
          sample_language: string | null
          severity: Database["public"]["Enums"]["risk"]
          sort_order: number
          unacceptable: string | null
        }
        Insert: {
          clause_type: string
          fallback?: string | null
          guidance?: string | null
          id?: string
          org_id: string
          playbook_id: string
          preferred: string
          required?: boolean
          sample_language?: string | null
          severity?: Database["public"]["Enums"]["risk"]
          sort_order?: number
          unacceptable?: string | null
        }
        Update: {
          clause_type?: string
          fallback?: string | null
          guidance?: string | null
          id?: string
          org_id?: string
          playbook_id?: string
          preferred?: string
          required?: boolean
          sample_language?: string | null
          severity?: Database["public"]["Enums"]["risk"]
          sort_order?: number
          unacceptable?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_rules_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          id: string
          is_default: boolean
          name: string
          org_id: string
          our_side: Database["public"]["Enums"]["our_side"]
          updated_at: string
          version: number
        }
        Insert: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          org_id: string
          our_side: Database["public"]["Enums"]["our_side"]
          updated_at?: string
          version?: number
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          org_id?: string
          our_side?: Database["public"]["Enums"]["our_side"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "playbooks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      qa_messages: {
        Row: {
          abstained: boolean
          answer: string
          contract_id: string
          created_at: string
          escalated: boolean
          feedback: number | null
          id: string
          latency_ms: number | null
          org_id: string
          question: string
          segments: Json
          user_id: string | null
        }
        Insert: {
          abstained?: boolean
          answer: string
          contract_id: string
          created_at?: string
          escalated?: boolean
          feedback?: number | null
          id?: string
          latency_ms?: number | null
          org_id: string
          question: string
          segments: Json
          user_id?: string | null
        }
        Update: {
          abstained?: boolean
          answer?: string
          contract_id?: string
          created_at?: string
          escalated?: boolean
          feedback?: number | null
          id?: string
          latency_ms?: number | null
          org_id?: string
          question?: string
          segments?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_messages_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      review_tasks: {
        Row: {
          assigned_to: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          id: string
          org_id: string
          reason: string
          resolution_note: string | null
          resolved_at: string | null
          source: string
          source_id: string | null
          status: Database["public"]["Enums"]["task_status"]
        }
        Insert: {
          assigned_to?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          org_id: string
          reason: string
          resolution_note?: string | null
          resolved_at?: string | null
          source: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
        }
        Update: {
          assigned_to?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          org_id?: string
          reason?: string
          resolution_note?: string | null
          resolved_at?: string | null
          source?: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
        }
        Relationships: [
          {
            foreignKeyName: "review_tasks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          p_org: string
          p_roles: Database["public"]["Enums"]["org_role"][]
        }
        Returns: boolean
      }
      is_member: { Args: { p_org: string }; Returns: boolean }
      match_chunks: {
        Args: {
          p_contract_id: string
          p_k?: number
          p_query_embedding: string
          p_query_text: string
          p_rrf_k?: number
        }
        Returns: {
          clause_id: string
          id: string
          page_end: number
          page_start: number
          score: number
          section_ref: string
          text: string
        }[]
      }
    }
    Enums: {
      contract_status:
        | "uploaded"
        | "parsing"
        | "extracting"
        | "embedding"
        | "scoring"
        | "ready"
        | "failed"
      contract_type: "nda_mutual" | "nda_one_way" | "msa" | "saas" | "other"
      org_role: "owner" | "attorney" | "reviewer" | "viewer"
      our_side: "mutual" | "discloser" | "recipient" | "customer" | "vendor"
      position: "preferred" | "fallback" | "unacceptable" | "not_covered"
      redline_status: "none" | "proposed" | "accepted" | "edited" | "rejected"
      risk: "low" | "medium" | "high"
      task_status: "open" | "in_progress" | "resolved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contract_status: [
        "uploaded",
        "parsing",
        "extracting",
        "embedding",
        "scoring",
        "ready",
        "failed",
      ],
      contract_type: ["nda_mutual", "nda_one_way", "msa", "saas", "other"],
      org_role: ["owner", "attorney", "reviewer", "viewer"],
      our_side: ["mutual", "discloser", "recipient", "customer", "vendor"],
      position: ["preferred", "fallback", "unacceptable", "not_covered"],
      redline_status: ["none", "proposed", "accepted", "edited", "rejected"],
      risk: ["low", "medium", "high"],
      task_status: ["open", "in_progress", "resolved"],
    },
  },
} as const
