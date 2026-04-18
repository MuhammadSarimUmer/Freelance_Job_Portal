import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ApplicationsList from "../ApplicationsList";
import { applicationService } from "../../api/services/contractService";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("../../components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock("../../api/services/contractService", () => ({
  applicationService: {
    getApplications: vi.fn(),
  },
}));

describe("ApplicationsList", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    applicationService.getApplications.mockReset();
  });

  it("renders applications and navigates on card click", async () => {
    applicationService.getApplications.mockResolvedValue({
      data: {
        data: [
          { appID: "app-1", appName: "Alpha App", appType: "WEB", currentVersion: "1.0.0", contracts: [] },
        ],
      },
    });

    render(
      <MemoryRouter>
        <ApplicationsList />
      </MemoryRouter>
    );

    expect(await screen.findByText("My Applications")).toBeInTheDocument();
    const card = await screen.findByTestId("application-card-app-1");
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith("/applications/app-1");
  });
});
