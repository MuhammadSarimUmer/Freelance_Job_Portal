import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { bugService } from "../bugService";
import { escrowService } from "../escrowService";
import { milestoneService } from "../milestoneService";
import api from "../../axiosInstance";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("escrowService", () => {
  it("posts release and refund with escrowID body", () => {
    escrowService.releaseEscrow("esc-1");
    escrowService.refundEscrow("esc-2");

    expect(api.post).toHaveBeenCalledWith("/escrow/release", { escrowID: "esc-1" });
    expect(api.post).toHaveBeenCalledWith("/escrow/refund", { escrowID: "esc-2" });
  });

  it("requests escrow history", () => {
    escrowService.getEscrowHistory();

    expect(api.get).toHaveBeenCalledWith("/escrow/history");
  });
});

describe("milestoneService", () => {
  it("creates milestones via /milestones", () => {
    const data = { contractID: "contract-1", title: "Setup" };

    milestoneService.createMilestone(data);

    expect(api.post).toHaveBeenCalledWith("/milestones", data);
  });

  it("requests milestones with params", () => {
    milestoneService.getMilestones({ contractID: "contract-2" });

    expect(api.get).toHaveBeenCalledWith("/milestones", { params: { contractID: "contract-2" } });
  });

  it("updates milestone status", () => {
    milestoneService.updateMilestoneStatus("milestone-1", "IN_PROGRESS");

    expect(api.patch).toHaveBeenCalledWith("/milestones/milestone-1/status", { status: "IN_PROGRESS" });
  });

  it("deletes milestones by id", () => {
    milestoneService.deleteMilestone("milestone-9");

    expect(api.delete).toHaveBeenCalledWith("/milestones/milestone-9");
  });
});

describe("bugService", () => {
  it("creates bugs via /bugs", () => {
    const data = { contractID: "contract-3", title: "Crash" };

    bugService.createBug(data);

    expect(api.post).toHaveBeenCalledWith("/bugs", data);
  });

  it("requests bugs with params", () => {
    bugService.getBugs({ contractID: "contract-4" });

    expect(api.get).toHaveBeenCalledWith("/bugs", { params: { contractID: "contract-4" } });
  });

  it("updates bug status", () => {
    bugService.updateBugStatus("bug-1", "RESOLVED");

    expect(api.patch).toHaveBeenCalledWith("/bugs/bug-1/status", { status: "RESOLVED" });
  });

  it("deletes bugs by id", () => {
    bugService.deleteBug("bug-2");

    expect(api.delete).toHaveBeenCalledWith("/bugs/bug-2");
  });
});
