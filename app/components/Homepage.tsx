import Header from "./Header";
import Content from "./Content";

type Props = {};

const Homepage = (props: Props) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-start bg-white">
      <Header />
      <Content />
    </div>
  );
};

export default Homepage;
