interface Props {
  title: string;
  value: number | string;
  extension?: string;
}

export function StatsCard(props: Props) {
  const { title, value, extension = null } = props;

  return (
    <div className={"bg-white p-5 rounded-xl shadow-md"}>
      <div className={"flex flex-col justify-between p-2 relative"}>
        <div className={"flex-1 mb-2"}>
          <div className={"text-lg"}>{title}</div>
        </div>
        <hr />
        <div className={"mt-4 flex-1 text-right flex justify-end"}>
          <div className={"text-4xl"}>{value}</div>
          {extension && <div className={"text-md w-fit ml-1"}>{extension}</div>}
        </div>
      </div>
    </div>
  );
}
