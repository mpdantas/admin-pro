import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Registrando a fonte Roboto
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Estilos do PDF
const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 35, fontFamily: 'Roboto', backgroundColor: '#FFFFFF' },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  section: { marginBottom: 15, borderTop: '1px solid #EEE', paddingTop: 15 },
  sectionTitle: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  fieldContainer: { flexDirection: 'row', marginBottom: 6 },
  label: { fontSize: 11, width: 140, fontWeight: 'bold' },
  value: { fontSize: 11, flex: 1 },
  observations: { fontSize: 11, fontStyle: 'italic', marginTop: 5 }
});

// Componente "Helper" para renderizar um campo apenas se ele tiver valor
const Field = ({ label, value }) => (
  value ? ( // Só renderiza se 'value' não for nulo, undefined ou vazio
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  ) : null
);

export default function ClientPdfDocument({ clientData }) {
  // Se os dados ainda não chegaram, não renderiza nada
  if (!clientData) {
    return null;
  }

  const { general, address, vehicle, observations } = clientData;

  // Formata a data de nascimento de forma segura
  const formattedBirthDate = general.birth_date ? new Date(general.birth_date).toLocaleDateString('pt-BR') : '';
  const formattedVehicleYear = (vehicle.ano_fabricacao || vehicle.ano_modelo) ? `${vehicle.ano_fabricacao || ''} / ${vehicle.ano_modelo || ''}` : '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Ficha Cadastral de Cliente</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Gerais</Text>
          <Field label="Nome" value={general.name} />
          <Field label="Data de Nascimento" value={formattedBirthDate} />
          <Field label="CPF" value={general.cpf} />
          <Field label="RG" value={general.rg} />
          <Field label="CNH" value={general.cnh} />
          <Field label="CNPJ" value={general.cnpj} />
          <Field label="Celular" value={general.celular} />
          <Field label="E-mail" value={general.email} />
        </View>

        {address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <Field label="Endereço" value={`${address.street || ''}, ${address.number || ''}`} />
            <Field label="Complemento" value={address.complement} />
            <Field label="Bairro" value={address.neighborhood} />
            <Field label="Cidade / UF" value={`${address.city || ''} / ${address.state || ''}`} />
            <Field label="CEP" value={address.zip_code} />
          </View>
        )}

        {vehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Veículo</Text>
            <Field label="Marca" value={vehicle.brand} />
            <Field label="Modelo" value={vehicle.model} />
            <Field label="Placa" value={vehicle.plate} />
            <Field label="Cor" value={vehicle.cor} />
            <Field label="Ano Fab./Modelo" value={formattedVehicleYear} />
            <Field label="Chassi" value={vehicle.chassi} />
            <Field label="Renavam" value={vehicle.renavam} />
          </View>
        )}
        
        {observations && (
           <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.observations}>{observations}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}