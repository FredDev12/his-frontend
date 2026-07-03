import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import BaseButton from "../shared/ui/base/BaseButton.vue";
import BaseInput from "../shared/ui/base/BaseInput.vue";
import BaseBadge from "../shared/ui/base/BaseBadge.vue";
import DataTable from "../shared/ui/data/DataTable.vue";

describe("Design System HIS", () => {
  it("renders base components", async () => {
    expect(mount(BaseButton, { slots: { default: "Créer" } }).text()).toContain("Créer");
    expect(mount(BaseInput, { props: { label: "Nom" } }).text()).toContain("Nom");
    expect(mount(BaseBadge, { slots: { default: "PAYE" } }).text()).toContain("PAYE");

    const table = mount(DataTable, {
      props: {
        columns: [{ key: "name", label: "Nom" }],
        rows: [{ id: 1, name: "Patient test" }]
      }
    });

    expect(table.text()).toContain("Patient test");
  });
});
