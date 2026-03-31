<script setup>
import { useRouter } from "vue-router"
import PersonCard from "../../../../persons/components/PersonCard.vue";

defineProps({
  agent:Object
})

</script>

<<template>
  <div class="bg-white shadow rounded p-4">

    <h3 class="font-bold mb-3">Fiche personnelle</h3>

    <!-- Sécurité -->
    <div v-if="!agent" class="text-gray-500 text-sm italic">
      Aucune donnée agent disponible
    </div>

    <!-- Affichage agent -->
    <div v-else class="grid grid-cols-2 gap-4">

      <PersonCard
        :person="{
          id: agent.id,
          nom: agent.nom_post + ' ' + agent.prenom,
          enVie: true,
          statut: agent.statut
        }"
        type="agent"
        roleLabel="Agent"
        :hasFiche="!!agent.patient_id"
        :personId="agent.id"
        :agentId="agent.id"
      />

      <!-- Infos complémentaires -->
      <div class="bg-gray-50 p-4 rounded">

        <p><b>Matricule :</b> {{ agent.cac_id_co }}</p>
        <p><b>Fonction :</b> {{ agent.fonction }}</p>
        <p><b>Site :</b> {{ agent.site }}</p>
        <p><b>Statut :</b> {{ agent.statut }}</p>
        <p><b>Téléphone :</b> {{ agent.telephone }}</p>

      </div>

    </div>

  </div>
</template>