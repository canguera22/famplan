export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      calendar_events: {
        Row: {
          all_day: boolean;
          assignee_id: string | null;
          created_at: string;
          created_by: string;
          description: string;
          ends_at: string;
          family_id: string;
          id: string;
          location: string | null;
          recurrence_rule: string | null;
          source_id: string | null;
          source_type: string;
          starts_at: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          all_day?: boolean;
          assignee_id?: string | null;
          created_at?: string;
          created_by: string;
          description?: string;
          ends_at: string;
          family_id: string;
          id?: string;
          location?: string | null;
          recurrence_rule?: string | null;
          source_id?: string | null;
          source_type?: string;
          starts_at: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          all_day?: boolean;
          assignee_id?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string;
          ends_at?: string;
          family_id?: string;
          id?: string;
          location?: string | null;
          recurrence_rule?: string | null;
          source_id?: string | null;
          source_type?: string;
          starts_at?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_events_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_events_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      card_comments: {
        Row: {
          author_id: string;
          body: string;
          card_id: string;
          created_at: string;
          family_id: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          card_id: string;
          created_at?: string;
          family_id: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          card_id?: string;
          created_at?: string;
          family_id?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "card_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_comments_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "list_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_comments_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      external_event_mappings: {
        Row: {
          calendar_event_id: string;
          connection_id: string;
          external_calendar_id: string;
          external_etag: string | null;
          external_event_id: string;
          family_id: string;
          id: string;
          last_synced_at: string | null;
          sync_state: string;
        };
        Insert: {
          calendar_event_id: string;
          connection_id: string;
          external_calendar_id: string;
          external_etag?: string | null;
          external_event_id: string;
          family_id: string;
          id?: string;
          last_synced_at?: string | null;
          sync_state?: string;
        };
        Update: {
          calendar_event_id?: string;
          connection_id?: string;
          external_calendar_id?: string;
          external_etag?: string | null;
          external_event_id?: string;
          family_id?: string;
          id?: string;
          last_synced_at?: string | null;
          sync_state?: string;
        };
        Relationships: [
          {
            foreignKeyName: "external_event_mappings_calendar_event_id_fkey";
            columns: ["calendar_event_id"];
            isOneToOne: false;
            referencedRelation: "calendar_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_event_mappings_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "integration_connections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_event_mappings_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      families: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name?: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      family_invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          family_id: string;
          id: string;
          invited_by: string;
          role: string;
          status: string;
          token: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          family_id: string;
          id?: string;
          invited_by: string;
          role?: string;
          status?: string;
          token?: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          family_id?: string;
          id?: string;
          invited_by?: string;
          role?: string;
          status?: string;
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_invitations_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_invitations_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      family_members: {
        Row: {
          family_id: string;
          joined_at: string;
          role: string;
          user_id: string;
        };
        Insert: {
          family_id: string;
          joined_at?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          family_id?: string;
          joined_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      integration_connections: {
        Row: {
          created_at: string;
          external_account_label: string | null;
          family_id: string;
          id: string;
          last_synced_at: string | null;
          provider: string;
          settings: Json;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          external_account_label?: string | null;
          family_id: string;
          id?: string;
          last_synced_at?: string | null;
          provider: string;
          settings?: Json;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          external_account_label?: string | null;
          family_id?: string;
          id?: string;
          last_synced_at?: string | null;
          provider?: string;
          settings?: Json;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "integration_connections_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "integration_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      list_cards: {
        Row: {
          all_day: boolean;
          assignee_id: string | null;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          created_by: string;
          due_at: string | null;
          family_id: string;
          id: string;
          list_id: string;
          notes: string;
          position: number;
          priority: string;
          recurrence_rule: string | null;
          show_on_calendar: boolean;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          all_day?: boolean;
          assignee_id?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          created_by: string;
          due_at?: string | null;
          family_id: string;
          id?: string;
          list_id: string;
          notes?: string;
          position?: number;
          priority?: string;
          recurrence_rule?: string | null;
          show_on_calendar?: boolean;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          all_day?: boolean;
          assignee_id?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          created_by?: string;
          due_at?: string | null;
          family_id?: string;
          id?: string;
          list_id?: string;
          notes?: string;
          position?: number;
          priority?: string;
          recurrence_rule?: string | null;
          show_on_calendar?: boolean;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "list_cards_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_cards_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_cards_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_cards_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_cards_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      lists: {
        Row: {
          archived_at: string | null;
          color: string;
          created_at: string;
          created_by: string;
          description: string;
          family_id: string;
          id: string;
          name: string;
          position: number;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          color?: string;
          created_at?: string;
          created_by: string;
          description?: string;
          family_id: string;
          id?: string;
          name: string;
          position?: number;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          color?: string;
          created_at?: string;
          created_by?: string;
          description?: string;
          family_id?: string;
          id?: string;
          name?: string;
          position?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lists_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lists_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_plans: {
        Row: {
          created_at: string;
          created_by: string;
          family_id: string;
          id: string;
          options: Json;
          status: string;
          updated_at: string;
          week_start: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          family_id: string;
          id?: string;
          options?: Json;
          status?: string;
          updated_at?: string;
          week_start: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          family_id?: string;
          id?: string;
          options?: Json;
          status?: string;
          updated_at?: string;
          week_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_plans_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_plans_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      people: {
        Row: {
          active: boolean;
          avatar_url: string | null;
          color: string;
          created_at: string;
          display_name: string;
          family_id: string;
          id: string;
          kind: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          active?: boolean;
          avatar_url?: string | null;
          color?: string;
          created_at?: string;
          display_name: string;
          family_id: string;
          id?: string;
          kind?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          active?: boolean;
          avatar_url?: string | null;
          color?: string;
          created_at?: string;
          display_name?: string;
          family_id?: string;
          id?: string;
          kind?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "people_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "people_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      planned_meals: {
        Row: {
          created_at: string;
          family_id: string;
          group_key: string;
          id: string;
          meal_date: string;
          meal_plan_id: string;
          recipe_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          family_id: string;
          group_key: string;
          id?: string;
          meal_date: string;
          meal_plan_id: string;
          recipe_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          family_id?: string;
          group_key?: string;
          id?: string;
          meal_date?: string;
          meal_plan_id?: string;
          recipe_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planned_meals_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planned_meals_meal_plan_id_fkey";
            columns: ["meal_plan_id"];
            isOneToOne: false;
            referencedRelation: "meal_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shopping_items: {
        Row: {
          category: string;
          created_at: string;
          family_id: string;
          id: string;
          ingredient_id: string | null;
          metadata: Json;
          name: string;
          pantry: boolean;
          purchase_quantity: number;
          purchased: boolean;
          removed: boolean;
          required_quantity: number;
          shopping_list_id: string;
          source: string;
          unit: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          family_id: string;
          id?: string;
          ingredient_id?: string | null;
          metadata?: Json;
          name: string;
          pantry?: boolean;
          purchase_quantity?: number;
          purchased?: boolean;
          removed?: boolean;
          required_quantity?: number;
          shopping_list_id: string;
          source?: string;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          family_id?: string;
          id?: string;
          ingredient_id?: string | null;
          metadata?: Json;
          name?: string;
          pantry?: boolean;
          purchase_quantity?: number;
          purchased?: boolean;
          removed?: boolean;
          required_quantity?: number;
          shopping_list_id?: string;
          source?: string;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_items_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_items_shopping_list_id_fkey";
            columns: ["shopping_list_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_lists: {
        Row: {
          created_at: string;
          created_by: string;
          family_id: string;
          id: string;
          meal_plan_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          family_id: string;
          id?: string;
          meal_plan_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          family_id?: string;
          id?: string;
          meal_plan_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_lists_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_lists_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey";
            columns: ["meal_plan_id"];
            isOneToOne: false;
            referencedRelation: "meal_plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_family_invitation: {
        Args: { invitation_token: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
