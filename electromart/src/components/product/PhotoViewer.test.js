import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PhotoViewer from "./PhotoViewer";

function Gallery({ photos }) {
  const [selected, setSelected] = useState(photos[0]);
  return <PhotoViewer photos={photos} selected={selected} onSelect={setSelected} title="Headphones" />;
}

test("opens the selected image and cycles in both directions", () => {
  const { container } = render(<Gallery photos={["front.webp", "side.webp"]} />);
  const dialog = container.querySelector("dialog");
  // jsdom does not implement the native dialog methods.
  dialog.showModal = () => dialog.setAttribute("open", "");
  dialog.close = () => dialog.removeAttribute("open");
  fireEvent.click(screen.getByRole("button", { name:"Enlarge" }));
  fireEvent.click(screen.getByRole("button", { name:"Next photo" }));
  expect(dialog.querySelector("img")).toHaveAttribute("src", "side.webp");
  fireEvent.keyDown(dialog, { key:"ArrowRight" });
  expect(dialog.querySelector("img")).toHaveAttribute("src", "front.webp");
  fireEvent.keyDown(dialog, { key:"ArrowLeft" });
  expect(dialog.querySelector("img")).toHaveAttribute("src", "side.webp");
  fireEvent.click(screen.getByRole("button", { name:"Close image viewer" }));
  expect(dialog).not.toHaveAttribute("open");
});

test("keeps a missing image readable and omits enlargement", () => {
  render(<Gallery photos={[]} />);
  expect(screen.getByRole("img", { name:"Headphones" })).toBeVisible();
  expect(screen.queryByRole("button", { name:"Enlarge" })).not.toBeInTheDocument();
});
