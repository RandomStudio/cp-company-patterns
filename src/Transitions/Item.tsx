interface Props {
  id: number;
}

const Item = (props: Props) => {
  return (
    <div>
      <h2>This is item {props.id}</h2>
    </div>
  );
};

export default Item;
