import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Hero from "./Hero";

function mount() { render(<MemoryRouter><Hero /></MemoryRouter>); }

test("opens on the audio collection with a working catalogue link", () => {
  mount();
  expect(screen.getByRole("button", {name:"Audio"})).toHaveAttribute("aria-pressed","true");
  expect(screen.getByRole("link", {name:"Shop headphones"})).toHaveAttribute("href","/products?category=Headphones");
  expect(screen.getByRole("link", {name:"Full catalogue"})).toHaveAttribute("href","/products");
});

test("switches image, copy and destination together", () => {
  mount();
  fireEvent.click(screen.getByRole("button", {name:"Workspace"}));
  expect(screen.getByRole("img", {name:/keys/})).toHaveAttribute("src","/media/design/editorial-keyboard.webp");
  expect(screen.getByRole("heading")).toHaveTextContent("desk.");
  expect(screen.getByRole("link", {name:"Shop desk gear"})).toHaveAttribute("href","/products?category=Computer%20Accessories");
});

test("horizontal swipes wrap the collection while vertical swipes leave it alone", () => {
  mount();
  const photo = () => screen.getByRole("img").parentElement;
  function swipe(x, y) {
    fireEvent.touchStart(photo(), {touches:[{clientX:10,clientY:10}]});
    fireEvent.touchEnd(photo(), {touches:[],changedTouches:[{clientX:x,clientY:y}]});
  }
  swipe(100,170);
  expect(screen.getByRole("button", {name:"Audio"})).toHaveAttribute("aria-pressed","true");
  swipe(100,12);
  expect(screen.getByRole("button", {name:"Camera"})).toHaveAttribute("aria-pressed","true");
  expect(screen.getByRole("link", {name:"Shop cameras"})).toHaveAttribute("href","/products?category=Cameras");
});
