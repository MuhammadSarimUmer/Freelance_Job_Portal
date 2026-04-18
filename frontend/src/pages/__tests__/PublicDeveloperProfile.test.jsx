import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PublicDeveloperProfile from "../PublicDeveloperProfile";
import { profileService } from "../../api/services/profileService";

vi.mock("../../components/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("../../api/services/profileService", () => ({
  profileService: {
    getDeveloperById: vi.fn(),
  },
}));

describe("PublicDeveloperProfile", () => {
  it("renders developer profile data", async () => {
    profileService.getDeveloperById.mockResolvedValue({
      data: {
        data: {
          developerID: "dev-1",
          experienceYears: 5,
          hourlyRate: 120,
          availabilityStatus: "AVAILABLE",
          cvUrl: "https://example.com/cv.pdf",
          knownTechs: [{ techID: "tech-1", tech: { techName: "React" }, proficiencyLevel: "EXPERT" }],
          user: { fullName: "Sam Developer" },
        },
      },
    });

    render(
      <MemoryRouter initialEntries={["/developers/dev-1"]}>
        <Routes>
          <Route path="/developers/:id" element={<PublicDeveloperProfile />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sam Developer")).toBeInTheDocument();
    expect(await screen.findByText(/React/)).toBeInTheDocument();
  });
});
