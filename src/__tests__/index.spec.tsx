import { render, screen } from "@testing-library/react";

const Hello = () => {
  return <div>Hello</div>;
};

describe("Hello", () => {
  it("should render", () => {
    render(<Hello />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
