<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="nb-page flex flex-center q-pa-md">
        <div class="full-width" style="max-width: 440px">
          <q-card class="nb-card q-pa-lg">
            <div class="row items-center q-col-gutter-md">
              <q-avatar size="52px" rounded>
                <img src="/public/icons/logo.png" alt="NABLAMA" />
              </q-avatar>

              <div>
                <div class="text-h6 nb-title">NABLAMA</div>
                <div class="text-caption nb-muted">Control de Obra</div>
              </div>
            </div>

            <div class="q-mt-lg">
              <router-view />
            </div>
          </q-card>

          <div class="text-caption text-center q-mt-md nb-muted">
            © {{ new Date().getFullYear() }} NABLAMA S.A.
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>