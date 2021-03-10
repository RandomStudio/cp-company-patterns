interface Props {
  id: number;
}

const Item = (props: Props) => {
  return (
    <div>
      <h2>This is item {props.id}</h2>
      <a href="/transition">Back</a>
    </div>
  );
};

export default Item;
