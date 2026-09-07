import KeycapButton from "@/components/keycap-button";
import styles from "./resource-page.module.css";

export type FormFieldOption = { id: string; label: string };

export type FormField = {
  name: string;
  label: string;
  type: "text" | "datetime-local" | "number" | "select" | "checkbox";
  options?: readonly FormFieldOption[];
  pattern?: string;
  min?: number;
  placeholder?: string;
};

export type FormQuery = {
  created?: string;
  error?: string;
  form?: string;
};

type FormSurfaceProps = {
  formKey: string;
  title: string;
  description?: string;
  fields: readonly FormField[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  query: FormQuery;
};

export function FormSurface({
  formKey,
  title,
  description,
  fields,
  action,
  submitLabel,
  query,
}: FormSurfaceProps) {
  const created = query.created === formKey;
  const error = query.form === formKey ? query.error : undefined;

  return (
    <section className={styles.surface}>
      <h2 className={styles.surfaceTitle}>{title}</h2>
      {created ? (
        <p className={`${styles.notice} ${styles.success}`}>Saved.</p>
      ) : null}
      {error ? (
        <p className={`${styles.notice} ${styles.error}`}>{error}</p>
      ) : null}
      <form action={action} className={styles.form}>
        {description ? (
          <p className={styles.formDescription}>{description}</p>
        ) : null}
        {fields.map((field) => (
          <label
            className={
              field.type === "checkbox" ? styles.checkboxRow : styles.label
            }
            key={field.name}
          >
            {field.type === "checkbox" ? (
              <>
                <input type="checkbox" name={field.name} value="on" />
                <span>{field.label}</span>
              </>
            ) : (
              <>
                {field.label}
                {field.type === "select" ? (
                  <select
                    className={styles.select}
                    name={field.name}
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {field.options?.map((option) => (
                      <option value={option.id} key={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={styles.input}
                    name={field.name}
                    type={field.type}
                    required
                    pattern={field.pattern}
                    min={field.min}
                    placeholder={field.placeholder}
                  />
                )}
              </>
            )}
          </label>
        ))}
        <KeycapButton type="submit">{submitLabel}</KeycapButton>
      </form>
    </section>
  );
}
