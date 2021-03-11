interface Props {
  index: number;
  id: number;
  url: string;
}

const Item = (props: Props) => {
  return (
    <div className="Item">
      <h2>
        [{props.index}]:#{props.id}
      </h2>
      <img src={props.url}></img>
      <div>
        <a href="/transition">Back</a>
      </div>
    </div>
  );
};

export default Item;
