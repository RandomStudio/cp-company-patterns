import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";

const items = [0, 1, 2];

interface Props {
  startTransitionFunction: (itemId?: number) => void;
}

const Grid = (props: Props) => {
  const { url } = useRouteMatch();
  return (
    <div>
      Grid items:
      <ul>
        {items.map((i) => (
          <li key={`grid-item-${i}`}>
            <Link
              onClick={() => {
                console.log("start transition!");
                props.startTransitionFunction(i);
              }}
              to={`${url}/${i}`}
            >
              Item {i}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Grid;
