package com.example.parcialFashionEvent.repositories;

import com.example.parcialFashionEvent.entity.InvitadoExterno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IInvitadoExternoRepository extends JpaRepository<InvitadoExterno, Long> {

    // Encuentra un invitado externo por su correo electrónico
    Optional<InvitadoExterno> findByCorreo(String correo);

    // Encuentra todos los invitados externos por el nombre de la empresa
    List<InvitadoExterno> findByEmpresa(String empresa);

    // Consulta personalizada para encontrar invitados externos por nombre y apellido
    @Query("SELECT ie FROM InvitadoExterno ie WHERE ie.nombre = :nombre AND ie.apellido = :apellido")
    List<InvitadoExterno> findByNombreAndApellido(@Param("nombre") String nombre, @Param("apellido") String apellido);
}