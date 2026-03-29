import Link from "next/link";

interface FilterOption {
  label: string;
  value: string;
}

interface AdminListControlsProps {
  action: string;
  keyword?: string;
  keywordPlaceholder?: string;
  filters?: Array<{
    name: string;
    value?: string;
    placeholder: string;
    options: FilterOption[];
  }>;
}

export function AdminListControls(props: AdminListControlsProps) {
  const { action, keyword, keywordPlaceholder = "输入关键词搜索", filters = [] } = props;

  return (
    <form className="admin-filter-bar" action={action}>
      <input name="keyword" defaultValue={keyword} placeholder={keywordPlaceholder} />
      {filters.map((filter) => (
        <select key={filter.name} name={filter.name} defaultValue={filter.value ?? ""}>
          <option value="">{filter.placeholder}</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      <button className="button-secondary" type="submit">
        筛选
      </button>
      <Link className="button-ghost" href={action}>
        重置
      </Link>
    </form>
  );
}
