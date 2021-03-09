import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";

const Grid = () => {
  const { url } = useRouteMatch();
  return (
    <div>
      Grid items:
      <ul>
        <li>
          <Link to={`${url}/1`}>Item 1</Link>
        </li>
        <li>
          <Link to={`${url}/2`}>Item 2</Link>
        </li>
      </ul>
    </div>
  );
};

export default Grid;
