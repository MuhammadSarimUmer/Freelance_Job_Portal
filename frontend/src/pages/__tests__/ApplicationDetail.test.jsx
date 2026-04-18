import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ApplicationDetail from "../ApplicationDetail";
import { applicationService } from "../../api/services/contractService";

vi.mock("../../components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock("../../components/layout/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

const mockAddToast = vi.fn();
vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock("../../api/services/contractService", () => ({
  applicationService: {
    getApplicationById: vi.fn(),
    updateApplication: vi.fn(),
    deleteApplication: vi.fn(),
  },
}));

describe("ApplicationDetail", () => {
  it("updates application details", async () => {
    const app = {
      appID: "app-1",
      appName: "Alpha App",
      appType: "WEB",
      description: "Initial description",
      currentVersion: "1.0.0",
      contracts: [],
    };

    applicationService.getApplicationById.mockResolvedValue({ data: { data: app } });
    applicationService.updateApplication.mockResolvedValue({ data: { data: app } });

    render(
      <MemoryRouter initialEntries={["/applications/app-1"]}>
        <Routes>
          <Route path="/applications/:id" element={<ApplicationDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/alpha app/i);

    const editButton = await screen.findByText("Edit Application");
    await userEvent.click(editButton);

    const nameInput = screen.getByLabelText("App Name");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Beta App");

    const saveButton = screen.getByText("Save Changes");
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(applicationService.updateApplication).toHaveBeenCalledWith("app-1", {
        appName: "Beta App",
        appType: "WEB",
        description: "Initial description",
        currentVersion: "1.0.0",
      });
    });
  });
});
