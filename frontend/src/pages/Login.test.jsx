import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import { AuthProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom"; // <-- IMPORTANTE

describe("Login component", () => {
  it("renders the email input field", () => {
    render(
      <MemoryRouter> {/* <-- ENVOLVER */}
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/correo electrónico/i)).toBeInTheDocument();

  });
});
