import { useParams } from "react-router-dom";

const Item = () => {
  const { itemId } = useParams<{ itemId: string }>();

  return <div>This is item {itemId}</div>;
};

export default Item;
